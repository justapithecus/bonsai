import type { PhaseDurationObservation, SeasonDerivation } from '@grove/core'

interface PhaseIndicatorProps {
  phase?: string
  season?: SeasonDerivation
  phaseDuration?: PhaseDurationObservation
}

export function PhaseIndicator({ phase, season, phaseDuration }: PhaseIndicatorProps) {
  if (!phase) {
    return (
      <div className="text-sm" style={{ color: 'var(--grove-text-muted)' }}>
        <span className="opacity-60">Phase:</span> undeclared
      </div>
    )
  }

  return (
    <div>
      <div className="text-sm" style={{ color: 'var(--grove-text)' }}>
        <span
          className="opacity-60"
          style={{ color: 'var(--grove-text-muted)' }}
        >
          Phase:
        </span>{' '}
        {phase}
      </div>
      {season && (
        <div
          className="text-xs mt-1"
          style={{ color: 'var(--grove-text-muted)' }}
        >
          Season: {season.season}
          {season.dormancyMode && ` (${season.dormancyMode})`} — derived from
          phase &ldquo;{season.sourcePhase}&rdquo;
        </div>
      )}
      {phaseDuration && (
        <div
          className="text-xs mt-1"
          style={{ color: 'var(--grove-text-muted)' }}
        >
          Phase declared {phaseDuration.daysSinceDeclared} days ago
        </div>
      )}
    </div>
  )
}
