import type { CapabilityObservation } from '@grove/core'

interface CapabilityDisplayProps {
  capability?: CapabilityObservation
}

export function CapabilityDisplay({ capability }: CapabilityDisplayProps) {
  if (!capability) return null

  return (
    <div>
      <div className="text-sm" style={{ color: 'var(--grove-text)' }}>
        <span
          className="opacity-60"
          style={{ color: 'var(--grove-text-muted)' }}
        >
          Capability infrastructure:
        </span>
      </div>

      {capability.observedInfrastructure.length > 0 && (
        <div
          className="text-xs mt-2"
          style={{ color: 'var(--grove-text-muted)' }}
        >
          <span className="opacity-60">Observed:</span>{' '}
          {capability.observedInfrastructure.join(', ')}
        </div>
      )}

      {capability.descriptions.length > 0 && (
        <div className="mt-2 space-y-1">
          {capability.descriptions.map((desc, i) => (
            <p
              key={i}
              className="text-xs"
              style={{ color: 'var(--grove-text-muted)' }}
            >
              {desc}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
