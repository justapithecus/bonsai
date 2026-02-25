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
 */
export function buildTimeline(
  snapshotsDesc: SnapshotRow[],
  declarationsDesc: DeclarationRow[],
  freshSnapshotRecorded: boolean,
): TimelineEntry[] {
  const densityEntries = buildDensityEntries(snapshotsDesc)
  const declarationEntries = buildDeclarationEntries(declarationsDesc)

  // Merge both lists chronologically DESC (most recent first)
  const merged = [...densityEntries, ...declarationEntries].sort(
    (a, b) => b.observedAt.localeCompare(a.observedAt),
  )

  // Mark the most recent density entry as freshly recorded if applicable
  if (freshSnapshotRecorded) {
    const first = merged.find(
      (e) => e.kind === 'density_transition' || e.kind === 'density_span',
    )
    if (first && first.kind === 'density_transition') {
      first.freshlyRecorded = true
    }
  }

  return merged
}

// ── Density entries ──────────────────────────────────────────────

function buildDensityEntries(
  snapshotsDesc: SnapshotRow[],
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

  // Emit transition for the first observation
  entries.push({
    kind: 'density_transition',
    observedAt: withTier[0].observedAt,
    fromTier: null,
    toTier: withTier[0].densityTier,
  })
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
