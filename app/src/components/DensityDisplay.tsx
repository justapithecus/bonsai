import type { DensityObservation } from '@grove/core'

interface DensityDisplayProps {
  density?: DensityObservation
}

function formatTierName(tier: string): string {
  return tier.replace(/_/g, ' ')
}

export function DensityDisplay({ density }: DensityDisplayProps) {
  if (!density) {
    return (
      <div className="text-sm" style={{ color: 'var(--grove-text-muted)' }}>
        <span className="opacity-60">Structural character:</span> not yet
        observed
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
          Structural character:
        </span>{' '}
        {formatTierName(density.tier)}
      </div>
      <div
        className="text-xs mt-1"
        style={{ color: 'var(--grove-text-muted)' }}
      >
        {density.description}
      </div>
    </div>
  )
}
