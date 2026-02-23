import type {
  ConsolidationObservation,
  DensityObservation,
  DensityTier,
  StructuralSignals,
} from './types'

const TIER_DESCRIPTIONS: Record<DensityTier, string> = {
  sparse:
    'A spare structure with few files and little recent change observed.',
  rooting:
    'An establishing structure — some files present, with modest observed activity.',
  thickening:
    'A developing structure with moderate file count and observable change.',
  dense_canopy:
    'A substantial structure with many files and sustained observed activity.',
  tangled_thicket:
    'A complex structure where high file count, frequent change, and elapsed review intervals converge.',
}

/**
 * Observe structural density from available signals.
 * Pure observation: no judgment, no urgency.
 * Returns undefined if insufficient signals are available.
 */
export function observeStructuralDensity(
  signals: StructuralSignals,
  consolidation?: ConsolidationObservation,
): DensityObservation | undefined {
  const { fileCount, commitsLast30d, commitsLast90d } = signals

  // Require at least one core signal
  if (
    fileCount === undefined &&
    commitsLast30d === undefined &&
    commitsLast90d === undefined
  ) {
    return undefined
  }

  const surface =
    fileCount !== undefined ? Math.tanh(fileCount / 200) : 0

  const tempoRaw30 =
    commitsLast30d !== undefined ? Math.tanh(commitsLast30d / 15) : 0
  const tempoRaw90 =
    commitsLast90d !== undefined ? Math.tanh(commitsLast90d / 40) : 0
  const tempo = 0.6 * tempoRaw30 + 0.4 * tempoRaw90

  const entanglement =
    signals.ecosystemDependencyCount !== undefined
      ? Math.tanh(signals.ecosystemDependencyCount / 5)
      : 0

  const neglect = computeNeglect(consolidation, surface)

  const composite =
    0.35 * surface + 0.25 * tempo + 0.15 * entanglement + 0.25 * neglect

  const tier = classifyTier(composite)

  return {
    tier,
    description: TIER_DESCRIPTIONS[tier],
    signals,
  }
}

function computeNeglect(
  consolidation: ConsolidationObservation | undefined,
  surface: number,
): number {
  if (!consolidation || !consolidation.elapsed) {
    return 0
  }

  const ratio = consolidation.daysSinceActivity / consolidation.intervalDays
  // Scale neglect by surface — larger repos accumulate structural weight faster
  return Math.min(1, (ratio - 1) * 0.5) * Math.max(0.3, surface)
}

function classifyTier(composite: number): DensityTier {
  if (composite < 0.2) return 'sparse'
  if (composite < 0.4) return 'rooting'
  if (composite < 0.6) return 'thickening'
  if (composite < 0.8) return 'dense_canopy'
  return 'tangled_thicket'
}
