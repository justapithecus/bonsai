import type {
  Climate,
  EcosystemTriggerResult,
  RepositoryEcology,
} from '@grove/core'
import {
  assessPersistence,
  buildRepoPersistenceContext,
  deriveSnapshotRelation,
  evaluateEcosystemTriggers,
  PERSISTENCE_WINDOW_SIZE,
} from '@grove/core'

import type { GroveDb } from './db'
import { getPortfolioSnapshotWindow } from './db'

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
