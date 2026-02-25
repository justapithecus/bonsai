import type {
  DensityTier,
  MotionDriftObservation,
  Phase,
  ReferenceSnapshot,
  ShapeDriftObservation,
  StructuralSignals,
} from './types'

/**
 * Minimal snapshot row shape — matches the subset of fields
 * returned by getSnapshotHistory that drift detection needs.
 */
interface SnapshotRow {
  fileCount: number | null
  ecosystemDependencyCount: number | null
  densityTier: string | null
  observedAt: string
}

/**
 * Find the snapshot row closest to a phase declaration timestamp.
 *
 * Walks DESC-ordered rows to find the one closest to (but not before)
 * phaseTimestamp. If none is at-or-after, takes the nearest before it.
 * Returns undefined if snapshotsDesc is empty or phaseTimestamp is undefined.
 */
export function findReferenceSnapshot(
  phaseTimestamp: string | undefined,
  snapshotsDesc: SnapshotRow[],
): ReferenceSnapshot | undefined {
  if (!phaseTimestamp || snapshotsDesc.length === 0) {
    return undefined
  }

  // Walk DESC-ordered rows. All rows with observedAt >= phaseTimestamp
  // are candidates; pick the one closest to the timestamp (last in the
  // at-or-after group). If none qualify, the first row before the
  // timestamp (closest before) is used as fallback.
  let closestAtOrAfter: SnapshotRow | undefined
  let closestBefore: SnapshotRow | undefined

  for (const row of snapshotsDesc) {
    if (row.observedAt >= phaseTimestamp) {
      // DESC order — keep overwriting; the last match is closest to timestamp
      closestAtOrAfter = row
    } else {
      // First row before the timestamp — closest before
      if (!closestBefore) {
        closestBefore = row
      }
    }
  }

  const matched = closestAtOrAfter ?? closestBefore
  if (!matched) {
    return undefined
  }

  return {
    ...(matched.fileCount !== null && { fileCount: matched.fileCount }),
    ...(matched.ecosystemDependencyCount !== null && {
      ecosystemDependencyCount: matched.ecosystemDependencyCount,
    }),
    ...(matched.densityTier !== null && {
      densityTier: matched.densityTier as DensityTier,
    }),
    observedAt: matched.observedAt,
  }
}

/**
 * Observe shape drift — factual structural comparison between a
 * reference snapshot and current signals.
 *
 * Returns undefined when no observable shift exists (silence is valid).
 */
export function observeShapeDrift(
  referenceSnapshot: ReferenceSnapshot,
  currentSignals: StructuralSignals,
  currentDensityTier: DensityTier | undefined,
): ShapeDriftObservation | undefined {
  const descriptions: string[] = []

  // File count shift
  if (
    referenceSnapshot.fileCount !== undefined &&
    currentSignals.fileCount !== undefined &&
    referenceSnapshot.fileCount !== currentSignals.fileCount
  ) {
    descriptions.push(
      `File count has shifted from ${referenceSnapshot.fileCount} to ${currentSignals.fileCount} since the current phase was declared.`,
    )
  }

  // Ecosystem dependency count shift
  if (
    referenceSnapshot.ecosystemDependencyCount !== undefined &&
    currentSignals.ecosystemDependencyCount !== undefined &&
    referenceSnapshot.ecosystemDependencyCount !==
      currentSignals.ecosystemDependencyCount
  ) {
    descriptions.push(
      `Ecosystem dependency count has shifted from ${referenceSnapshot.ecosystemDependencyCount} to ${currentSignals.ecosystemDependencyCount} since the current phase was declared.`,
    )
  }

  // Density tier shift
  if (
    referenceSnapshot.densityTier !== undefined &&
    currentDensityTier !== undefined &&
    referenceSnapshot.densityTier !== currentDensityTier
  ) {
    descriptions.push(
      `Structural character has shifted from ${referenceSnapshot.densityTier.replace(/_/g, ' ')} to ${currentDensityTier.replace(/_/g, ' ')} since the current phase was declared.`,
    )
  }

  // Silence is valid — no observable shift
  if (descriptions.length === 0) {
    return undefined
  }

  return {
    referenceSnapshot,
    currentFileCount: currentSignals.fileCount,
    currentEcosystemDependencyCount: currentSignals.ecosystemDependencyCount,
    currentDensityTier,
    descriptions,
  }
}

/**
 * Phase-to-cadence expectation mapping.
 * - activity_expected: quiet cadence surfaces tension
 * - quiet_expected: active cadence surfaces tension
 * - moderate_expected: never surfaces tension (ambiguous cadence is valid)
 */
type CadenceExpectation =
  | 'activity_expected'
  | 'quiet_expected'
  | 'moderate_expected'

const PHASE_CADENCE: Record<Phase, CadenceExpectation> = {
  emerging: 'activity_expected',
  expanding: 'activity_expected',
  consolidating: 'moderate_expected',
  pruning: 'moderate_expected',
  resting: 'quiet_expected',
  archival: 'quiet_expected',
}

/**
 * Observe motion drift — tension between declared phase and
 * observed commit cadence.
 *
 * Returns undefined when no tension, commitsLast30d is undefined,
 * or phase has moderate expectation (never tenses).
 */
export function observeMotionDrift(
  phase: Phase,
  commitsLast30d: number | undefined,
  commitsLast90d: number | undefined,
): MotionDriftObservation | undefined {
  if (commitsLast30d === undefined) {
    return undefined
  }

  const expectation = PHASE_CADENCE[phase]

  // Moderate expectation never surfaces tension
  if (expectation === 'moderate_expected') {
    return undefined
  }

  // Cadence bands
  const isQuiet = commitsLast30d <= 2
  const isActive = commitsLast30d >= 16

  if (expectation === 'activity_expected' && isQuiet) {
    return {
      phase,
      commitsLast30d,
      commitsLast90d,
      description: `This project is in the ${phase} phase, but fewer than 3 commits have been observed in the past 30 days. The declared phase and observed cadence appear in tension.`,
    }
  }

  if (expectation === 'quiet_expected' && isActive) {
    return {
      phase,
      commitsLast30d,
      commitsLast90d,
      description: `This project is in the ${phase} phase, but ${commitsLast30d} commits have been observed in the past 30 days. The declared phase and observed cadence appear in tension.`,
    }
  }

  return undefined
}
