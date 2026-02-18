import type { ConsolidationObservation } from '@grove/core'

interface ConsolidationDisplayProps {
  consolidation?: ConsolidationObservation
}

export function ConsolidationDisplay({
  consolidation,
}: ConsolidationDisplayProps) {
  if (!consolidation) {
    return (
      <div className="text-sm" style={{ color: 'var(--grove-text-muted)' }}>
        <span className="opacity-60">Consolidation interval:</span>{' '}
        undeclared
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
          Consolidation interval:
        </span>{' '}
        {consolidation.intervalDays} days
      </div>
      <div
        className="text-xs mt-1"
        style={{ color: 'var(--grove-text-muted)' }}
      >
        {consolidation.daysSinceActivity} days since last observed activity
      </div>
      {consolidation.elapsed && (
        <div
          className="text-xs mt-1"
          style={{ color: 'var(--grove-text-muted)' }}
        >
          Consolidation review available
        </div>
      )}
    </div>
  )
}
