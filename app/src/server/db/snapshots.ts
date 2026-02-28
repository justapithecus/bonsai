import type {
  DensityObservation,
  RepositoryEcology,
  StructuralSignals,
} from '@grove/core'
import { desc, eq } from 'drizzle-orm'

import type { GroveDb } from './client'
import { getDb } from './client'
import { ecologySnapshots, repositories } from './schema'

/** Minimum interval between snapshots for the same repository (1 hour). */
const MIN_SNAPSHOT_INTERVAL_MS = 60 * 60 * 1000

interface RepositoryRow {
  fullName: string
  htmlUrl: string
  defaultBranch: string
  pushedAt?: string | null
  sizeKb?: number | null
}

/**
 * Upsert a single repository into the reference table.
 */
export function upsertRepository(repo: RepositoryRow, db: GroveDb = getDb()) {
  const now = new Date().toISOString()
  db.insert(repositories)
    .values({
      fullName: repo.fullName,
      htmlUrl: repo.htmlUrl,
      defaultBranch: repo.defaultBranch,
      pushedAt: repo.pushedAt ?? null,
      sizeKb: repo.sizeKb ?? null,
      lastObservedAt: now,
    })
    .onConflictDoUpdate({
      target: repositories.fullName,
      set: {
        htmlUrl: repo.htmlUrl,
        defaultBranch: repo.defaultBranch,
        pushedAt: repo.pushedAt ?? null,
        sizeKb: repo.sizeKb ?? null,
        lastObservedAt: now,
      },
    })
    .run()
}

/**
 * Upsert multiple repositories in a single transaction.
 */
export function upsertRepositories(
  repos: RepositoryRow[],
  db: GroveDb = getDb(),
) {
  db.transaction((tx) => {
    const now = new Date().toISOString()
    for (const repo of repos) {
      tx.insert(repositories)
        .values({
          fullName: repo.fullName,
          htmlUrl: repo.htmlUrl,
          defaultBranch: repo.defaultBranch,
          pushedAt: repo.pushedAt ?? null,
          sizeKb: repo.sizeKb ?? null,
          lastObservedAt: now,
        })
        .onConflictDoUpdate({
          target: repositories.fullName,
          set: {
            htmlUrl: repo.htmlUrl,
            defaultBranch: repo.defaultBranch,
            pushedAt: repo.pushedAt ?? null,
            sizeKb: repo.sizeKb ?? null,
            lastObservedAt: now,
          },
        })
        .run()
    }
  })
}

/**
 * Record a single ecology snapshot.
 * Skips insert if the most recent snapshot for this repo is within the minimum interval.
 *
 * The interval check and insert run inside a transaction so the guard
 * is atomic — prevents duplicate snapshots if the deployment model
 * ever changes from synchronous single-process.
 */
export function recordSnapshot(
  ecology: RepositoryEcology,
  signals?: StructuralSignals,
  density?: DensityObservation,
  db: GroveDb = getDb(),
): boolean {
  const now = new Date()
  // Wrap check+insert in a transaction for atomicity.
  // better-sqlite3 transactions acquire an EXCLUSIVE lock, so concurrent
  // callers (if any) block until this completes.
  return db.transaction(() => {
    if (isWithinInterval(ecology.fullName, now, db)) return false
    db.insert(ecologySnapshots)
      .values(buildSnapshotValues(ecology, signals, density, now))
      .run()
    return true
  })
}

/**
 * Record ecology snapshots for multiple repositories in a single transaction.
 * Interval check and inserts are all inside the transaction for atomicity.
 */
export function recordSnapshotBatch(
  entries: Array<{
    ecology: RepositoryEcology
    signals?: StructuralSignals
    density?: DensityObservation
  }>,
  db: GroveDb = getDb(),
) {
  const now = new Date()
  db.transaction(() => {
    for (const { ecology, signals, density } of entries) {
      if (isWithinInterval(ecology.fullName, now, db)) continue
      db.insert(ecologySnapshots)
        .values(buildSnapshotValues(ecology, signals, density, now))
        .run()
    }
  })
}

/**
 * Get the most recent snapshot for a repository.
 */
export function getLatestSnapshot(fullName: string, db: GroveDb = getDb()) {
  return (
    db
      .select()
      .from(ecologySnapshots)
      .where(eq(ecologySnapshots.fullName, fullName))
      .orderBy(desc(ecologySnapshots.observedAt))
      .limit(1)
      .get() ?? null
  )
}

/**
 * Get snapshot history for a repository, ordered by observed_at DESC.
 */
export function getSnapshotHistory(
  fullName: string,
  limit = 100,
  db: GroveDb = getDb(),
) {
  return db
    .select()
    .from(ecologySnapshots)
    .where(eq(ecologySnapshots.fullName, fullName))
    .orderBy(desc(ecologySnapshots.observedAt))
    .limit(limit)
    .all()
}

// ── Internal helpers ──────────────────────────────────────────────

function isWithinInterval(
  fullName: string,
  now: Date,
  db: GroveDb,
): boolean {
  const latest = db
    .select({ observedAt: ecologySnapshots.observedAt })
    .from(ecologySnapshots)
    .where(eq(ecologySnapshots.fullName, fullName))
    .orderBy(desc(ecologySnapshots.observedAt))
    .limit(1)
    .get()

  if (!latest) return false
  const elapsed = now.getTime() - new Date(latest.observedAt).getTime()
  return elapsed < MIN_SNAPSHOT_INTERVAL_MS
}

function buildSnapshotValues(
  ecology: RepositoryEcology,
  signals: StructuralSignals | undefined,
  density: DensityObservation | undefined,
  now: Date,
) {
  return {
    fullName: ecology.fullName,
    observedAt: now.toISOString(),
    classified: ecology.classified,
    intent: ecology.declaration?.intent ?? null,
    horizon: ecology.declaration?.horizon ?? null,
    role: ecology.declaration?.role ?? null,
    phase: ecology.declaration?.phase ?? null,
    steward: ecology.declaration?.steward ?? null,
    consolidationIntervalDays:
      ecology.declaration?.consolidation_interval_days ?? null,
    fileCount: signals?.fileCount ?? null,
    commitsLast30d: signals?.commitsLast30d ?? null,
    commitsLast90d: signals?.commitsLast90d ?? null,
    dependencyManifestsObserved: signals?.dependencyManifestsObserved
      ? JSON.stringify(signals.dependencyManifestsObserved)
      : null,
    ecosystemDependencyCount: signals?.ecosystemDependencyCount ?? null,
    densityTier: density?.tier ?? null,
    densityDescription: density?.description ?? null,
  }
}

/**
 * Maximum snapshots per day given MIN_SNAPSHOT_INTERVAL_MS of 1 hour.
 * Used to over-fetch from getSnapshotHistory so day-deduplication
 * covers the full window even when multiple snapshots exist per day.
 */
const MAX_SNAPSHOTS_PER_DAY = 24

/**
 * Fetch the last N *daily* snapshots for each repository in a portfolio.
 * Returns a Map keyed by fullName with one snapshot per calendar day (UTC),
 * most-recent-per-day, ordered DESC.
 *
 * The contract defines persistence as "in the last 14 daily snapshots"
 * (§4.2/§4.3), so intra-day duplicates are collapsed — the most recent
 * snapshot per UTC day is retained.
 *
 * Delegates to getSnapshotHistory per repo — portfolio sizes are small
 * (typically <30 repos), so sequential indexed lookups are efficient.
 */
export function getPortfolioSnapshotWindow(
  fullNames: string[],
  windowSize = 14,
  db: GroveDb = getDb(),
): Map<string, ReturnType<typeof getSnapshotHistory>> {
  const safeWindowSize = Math.max(0, Math.floor(windowSize))
  const result = new Map<string, ReturnType<typeof getSnapshotHistory>>()
  for (const name of fullNames) {
    // Over-fetch to account for multiple snapshots per day, then deduplicate.
    const rows = getSnapshotHistory(name, safeWindowSize * MAX_SNAPSHOTS_PER_DAY, db)
    result.set(name, deduplicateByDay(rows, safeWindowSize))
  }
  return result
}

/**
 * Deduplicate snapshot rows to one per UTC calendar day.
 * Rows must be ordered DESC (most recent first) — the first row
 * encountered for each day is kept.
 */
function deduplicateByDay<T extends { observedAt: string }>(
  rows: T[],
  limit: number,
): T[] {
  if (limit <= 0) return []
  const seen = new Set<string>()
  const result: T[] = []
  for (const row of rows) {
    const day = row.observedAt.slice(0, 10) // 'YYYY-MM-DD' from ISO 8601
    if (seen.has(day)) continue
    seen.add(day)
    result.push(row)
    if (result.length >= limit) break
  }
  return result
}

export { MIN_SNAPSHOT_INTERVAL_MS }
