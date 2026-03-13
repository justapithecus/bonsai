import type {
  Climate,
  ClimateProposal,
  EcosystemTriggerResult,
  RepoPersistenceContext,
  RepositoryEcology,
} from '@grove/core'
import {
  assessPersistence,
  buildRepoPersistenceContext,
  classifyRepository,
  deriveSnapshotRelation,
  escalatedObservation,
  evaluateClimateProposal,
  evaluateEcosystemTriggers,
  PERSISTENCE_WINDOW_SIZE,
  shouldWithdrawProposal,
} from '@grove/core'

import type { GroveDb } from './db'
import {
  getActiveProposal,
  getPortfolioSnapshotWindow,
  persistProposal,
  withdrawActiveProposal,
} from './db'

/**
 * Orchestrate the full snapshot → trigger pipeline for a portfolio.
 *
 * Returns undefined when triggers cannot be meaningfully evaluated:
 * - No declared climate (§5 requires it)
 * - No classified repos
 * - No repo has a complete persistence window (insufficient snapshot history)
 *
 * A defined result (even with triggered: false) means the pipeline
 * ran with sufficient data and its outcome is authoritative — no
 * fallback to heuristic paths.
 */
export function evaluatePortfolioEcosystemTriggers(
  climate: Climate | undefined,
  repositories: RepositoryEcology[],
  db?: GroveDb,
): EcosystemTriggerResult | undefined {
  // §5 requires declared climate
  if (!climate) return undefined

  // Filter to classified repos
  const classified = repositories.filter((r) => r.classified)
  if (classified.length === 0) return undefined

  const classifiedNames = classified.map((r) => r.fullName)

  // Fetch 14-day snapshot windows from SQLite (sync — better-sqlite3)
  const snapshotWindows = db
    ? getPortfolioSnapshotWindow(classifiedNames, 14, db)
    : getPortfolioSnapshotWindow(classifiedNames)

  // Build persistence contexts for each repo
  const repoByName = new Map(classified.map((r) => [r.fullName, r]))
  const contexts = classifiedNames
    .map((name) => {
      const repo = repoByName.get(name)
      if (!repo) return undefined

      const snapshots = snapshotWindows.get(name) ?? []
      const relations = snapshots.map((s) =>
        deriveSnapshotRelation(s.phase, climate),
      )
      const persistence = assessPersistence(relations)

      return buildRepoPersistenceContext(repo, persistence, climate)
    })
    .filter((ctx): ctx is NonNullable<typeof ctx> => ctx !== undefined)

  // If no repo has a complete persistence window, the pipeline cannot
  // produce meaningful results. Return undefined — the caller surfaces
  // no ecosystem balance invitations (§7 prohibits heuristic fallback).
  const hasSufficientData = contexts.some(
    (ctx) => ctx.persistence.totalSnapshots >= PERSISTENCE_WINDOW_SIZE,
  )
  if (!hasSufficientData) return undefined

  return evaluateEcosystemTriggers(contexts)
}

/** §5.4 — Double-window size for escalation evaluation. */
const ESCALATION_WINDOW_SIZE = PERSISTENCE_WINDOW_SIZE * 2

/**
 * §5.4 — Evaluate climate proposal escalation for a portfolio.
 *
 * Fetches a 28-day snapshot window, splits into current (days 1-14) and
 * prior (days 15-28) windows, evaluates triggers independently on each,
 * then checks if the same trigger persists across both.
 *
 * Also handles proposal lifecycle:
 * - Withdraws active proposals whose pattern has reversed
 * - Creates new proposals when escalation conditions are met
 *
 * Returns the active proposal (existing or newly created), or undefined.
 */
export function evaluatePortfolioProposals(
  climate: Climate,
  repositories: RepositoryEcology[],
  stewardId: number,
  db?: GroveDb,
): ClimateProposal | undefined {
  const classified = repositories.filter((r) => r.classified)
  if (classified.length === 0) return undefined

  const classifiedNames = classified.map((r) => r.fullName)
  const resolvedDb = db

  // Fetch 28-day snapshot window
  const fullWindows = resolvedDb
    ? getPortfolioSnapshotWindow(classifiedNames, ESCALATION_WINDOW_SIZE, resolvedDb)
    : getPortfolioSnapshotWindow(classifiedNames, ESCALATION_WINDOW_SIZE)

  // Check if any repo has 28 days of history
  let maxHistory = 0
  for (const snapshots of fullWindows.values()) {
    if (snapshots.length > maxHistory) maxHistory = snapshots.length
  }
  if (maxHistory < ESCALATION_WINDOW_SIZE) {
    // Not enough history for escalation — check existing proposal for withdrawal
    const currentTriggers = evaluatePortfolioEcosystemTriggers(climate, repositories, db)
    if (currentTriggers) {
      handleProposalWithdrawal(currentTriggers, resolvedDb)
    }
    return getActiveProposal(resolvedDb)?.climate
      ? toClimateProposal(getActiveProposal(resolvedDb)!)
      : undefined
  }

  const repoByName = new Map(classified.map((r) => [r.fullName, r]))

  // Split into current window (first 14) and prior window (next 14)
  const buildContextsFromWindow = (
    windowSlice: Map<string, Array<{ phase: string | null }>>,
  ): RepoPersistenceContext[] => {
    return classifiedNames
      .map((name) => {
        const repo = repoByName.get(name)
        if (!repo) return undefined
        const snapshots = windowSlice.get(name) ?? []
        const relations = snapshots.map((s) =>
          deriveSnapshotRelation(s.phase, climate),
        )
        const persistence = assessPersistence(relations)
        return buildRepoPersistenceContext(repo, persistence, climate)
      })
      .filter((ctx): ctx is NonNullable<typeof ctx> => ctx !== undefined)
  }

  // Split snapshots into two 14-day windows
  const currentWindowSnapshots = new Map<string, Array<{ phase: string | null }>>()
  const priorWindowSnapshots = new Map<string, Array<{ phase: string | null }>>()

  for (const [name, snapshots] of fullWindows) {
    currentWindowSnapshots.set(name, snapshots.slice(0, PERSISTENCE_WINDOW_SIZE))
    priorWindowSnapshots.set(name, snapshots.slice(PERSISTENCE_WINDOW_SIZE, ESCALATION_WINDOW_SIZE))
  }

  const currentContexts = buildContextsFromWindow(currentWindowSnapshots)
  const priorContexts = buildContextsFromWindow(priorWindowSnapshots)

  // Check data sufficiency for both windows
  const currentHasData = currentContexts.some(
    (ctx) => ctx.persistence.totalSnapshots >= PERSISTENCE_WINDOW_SIZE,
  )
  const priorHasData = priorContexts.some(
    (ctx) => ctx.persistence.totalSnapshots >= PERSISTENCE_WINDOW_SIZE,
  )

  if (!currentHasData || !priorHasData) {
    return getActiveProposal(resolvedDb)?.climate
      ? toClimateProposal(getActiveProposal(resolvedDb)!)
      : undefined
  }

  const currentTriggers = evaluateEcosystemTriggers(currentContexts)
  const priorTriggers = evaluateEcosystemTriggers(priorContexts)

  // Handle existing proposal lifecycle
  handleProposalWithdrawal(currentTriggers, resolvedDb)

  // Check if there's already an active proposal
  const existing = getActiveProposal(resolvedDb)
  if (existing) return toClimateProposal(existing)

  // Check §2.3 constraints
  const hasSetA = classified.some((r) => {
    const classification = classifyRepository(r)
    return classification?.stratum === 'structural_core'
  })

  const proposal = evaluateClimateProposal(currentTriggers, priorTriggers, {
    historyDays: maxHistory,
    classifiedRepoCount: classified.length,
    hasSetA,
  })

  if (proposal) {
    const observation = escalatedObservation(proposal, climate)
    persistProposal(proposal, observation, stewardId, resolvedDb)
    return proposal
  }

  return undefined
}

/**
 * Check if an active proposal's pattern has reversed; withdraw if so.
 */
function handleProposalWithdrawal(
  currentTriggers: EcosystemTriggerResult,
  db?: GroveDb,
) {
  const active = getActiveProposal(db)
  if (!active) return

  const proposal = toClimateProposal(active)
  if (shouldWithdrawProposal(proposal, currentTriggers)) {
    withdrawActiveProposal(db)
  }
}

/**
 * Convert a stored proposal row to a ClimateProposal.
 */
function toClimateProposal(stored: {
  climate: string
  basis: string
  triggerType: string
  observedSeason: string | null
}): ClimateProposal {
  return {
    climate: stored.climate as Climate,
    basis: stored.basis as ClimateProposal['basis'],
    triggerType: stored.triggerType as ClimateProposal['triggerType'],
    observedSeason: (stored.observedSeason as Climate) ?? undefined,
  }
}
