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
} from '@grove/core'

import { getPortfolioSnapshotWindow } from './db'

/**
 * Orchestrate the full snapshot → trigger pipeline for a portfolio.
 *
 * Returns undefined when triggers cannot be evaluated (no declared climate,
 * no classified repos). When snapshot history is insufficient (<14 daily
 * snapshots per repo), assessPersistence never sets persistent flags and
 * triggers return { triggered: false } — the caller falls back to the
 * pre-persistence heuristic.
 */
export function evaluatePortfolioEcosystemTriggers(
  climate: Climate | undefined,
  repositories: RepositoryEcology[],
): EcosystemTriggerResult | undefined {
  // §5 requires declared climate
  if (!climate) return undefined

  // Filter to classified repos
  const classified = repositories.filter((r) => r.classified)
  if (classified.length === 0) return undefined

  const classifiedNames = classified.map((r) => r.fullName)

  // Fetch 14-day snapshot windows from SQLite (sync — better-sqlite3)
  const snapshotWindows = getPortfolioSnapshotWindow(classifiedNames)

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

  return evaluateEcosystemTriggers(contexts)
}
