import type { Phase, SeasonDerivation } from './types'

const PHASE_TO_SEASON: Record<Phase, SeasonDerivation> = {
  emerging: { season: 'expansion', sourcePhase: 'emerging' },
  expanding: { season: 'expansion', sourcePhase: 'expanding' },
  consolidating: { season: 'consolidation', sourcePhase: 'consolidating' },
  pruning: { season: 'pruning', sourcePhase: 'pruning' },
  resting: {
    season: 'dormancy',
    sourcePhase: 'resting',
    dormancyMode: 'hibernation',
  },
  archival: {
    season: 'dormancy',
    sourcePhase: 'archival',
    dormancyMode: 'survival',
  },
}

/**
 * Derive season from declared phase.
 * Returns undefined if phase is undefined (unknown phase = unknown season).
 */
export function deriveSeason(
  phase: Phase | undefined,
): SeasonDerivation | undefined {
  if (phase === undefined) return undefined
  return PHASE_TO_SEASON[phase]
}
