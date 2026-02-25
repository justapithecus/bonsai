import type { declarationChanges, ecologySnapshots } from './db/schema'

type SnapshotRow = typeof ecologySnapshots.$inferSelect
type DeclarationRow = typeof declarationChanges.$inferSelect

export type TimelineEntry =
  | {
      kind: 'density_transition'
      observedAt: string
      fromTier: string | null
      toTier: string
      freshlyRecorded?: boolean
    }
  | {
      kind: 'density_span'
      observedAt: string
      tier: string
      spanEnd: string
      observationCount: number
      freshlyRecorded?: boolean
    }
  | {
      kind: 'declaration_change'
      observedAt: string
      changes: Array<{ field: string; from: string | null; to: string | null }>
    }

/**
 * Build a structural timeline from snapshot and declaration history.
 *
 * Both inputs are expected in DESC order (most recent first) as returned
 * by the DB query functions. The output is also DESC (most recent first).
 *
 * @param historyComplete - true when the fetched window contains the full
 *   history for this repo (i.e. rows returned < limit). When false, the
 *   earliest entry in the window is not necessarily the first-ever
 *   observation, so "first observed" framing is suppressed.
 */
export function buildTimeline(
  snapshotsDesc: SnapshotRow[],
  declarationsDesc: DeclarationRow[],
  freshSnapshotRecorded: boolean,
  historyComplete: boolean,
): TimelineEntry[] {
  const densityEntries = buildDensityEntries(snapshotsDesc, historyComplete)

  // Mark the most recent density entry as freshly recorded.
  // This is the last entry in ascending build order (last element in the array).
  if (freshSnapshotRecorded && densityEntries.length > 0) {
    const last = densityEntries[densityEntries.length - 1]
    if (last.kind === 'density_transition' || last.kind === 'density_span') {
      last.freshlyRecorded = true
    }
  }

  const declarationEntries = buildDeclarationEntries(declarationsDesc)

  // Merge both lists chronologically DESC (most recent first)
  const merged = [...densityEntries, ...declarationEntries].sort(
    (a, b) => b.observedAt.localeCompare(a.observedAt),
  )

  return merged
}

// ── Density entries ──────────────────────────────────────────────

function buildDensityEntries(
  snapshotsDesc: SnapshotRow[],
  historyComplete: boolean,
): TimelineEntry[] {
  // Reverse to ascending order for walk
  const asc = [...snapshotsDesc].reverse()

  // Filter out snapshots with null density tier
  const withTier = asc.filter(
    (s): s is SnapshotRow & { densityTier: string } => s.densityTier != null,
  )

  if (withTier.length === 0) return []

  const entries: TimelineEntry[] = []

  // Walk ascending — detect transitions and compress spans
  let runStart = withTier[0]
  let runCount = 1
  let prevTier: string | null = null

  // Only emit "first observed" (fromTier: null) when the history window
  // contains the complete record. When truncated, the earliest snapshot
  // in the window is not the first-ever observation.
  if (historyComplete) {
    entries.push({
      kind: 'density_transition',
      observedAt: withTier[0].observedAt,
      fromTier: null,
      toTier: withTier[0].densityTier,
    })
  }
  prevTier = withTier[0].densityTier

  for (let i = 1; i < withTier.length; i++) {
    const snap = withTier[i]

    if (snap.densityTier === prevTier) {
      // Continue the run
      runCount++
    } else {
      // Emit span for the completed run (only if run >= 2)
      if (runCount >= 2) {
        entries.push({
          kind: 'density_span',
          observedAt: runStart.observedAt,
          tier: prevTier!,
          spanEnd: withTier[i - 1].observedAt,
          observationCount: runCount,
        })
      }

      // Emit transition
      entries.push({
        kind: 'density_transition',
        observedAt: snap.observedAt,
        fromTier: prevTier,
        toTier: snap.densityTier,
      })

      prevTier = snap.densityTier
      runStart = snap
      runCount = 1
    }
  }

  // Emit trailing span if run >= 2
  if (runCount >= 2) {
    entries.push({
      kind: 'density_span',
      observedAt: runStart.observedAt,
      tier: prevTier!,
      spanEnd: withTier[withTier.length - 1].observedAt,
      observationCount: runCount,
    })
  }

  return entries
}

// ── Declaration entries ──────────────────────────────────────────

const TRACKED_FIELDS = [
  'phase',
  'intent',
  'horizon',
  'role',
  'steward',
  'consolidationIntervalDays',
] as const

function buildDeclarationEntries(
  declarationsDesc: DeclarationRow[],
): TimelineEntry[] {
  // Reverse to ascending order for walk
  const asc = [...declarationsDesc].reverse()

  if (asc.length === 0) return []

  const entries: TimelineEntry[] = []

  for (let i = 1; i < asc.length; i++) {
    const prev = asc[i - 1]
    const curr = asc[i]
    const changes: Array<{ field: string; from: string | null; to: string | null }> = []

    for (const field of TRACKED_FIELDS) {
      const fromVal = fieldToString(prev[field])
      const toVal = fieldToString(curr[field])
      if (fromVal !== toVal) {
        changes.push({ field, from: fromVal, to: toVal })
      }
    }

    if (changes.length > 0) {
      entries.push({
        kind: 'declaration_change',
        observedAt: curr.observedAt,
        changes,
      })
    }
  }

  return entries
}

function fieldToString(value: string | number | boolean | null | undefined): string | null {
  if (value == null) return null
  return String(value)
}
