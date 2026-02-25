import type { MotionDriftObservation, ShapeDriftObservation } from '@grove/core'

interface DriftDisplayProps {
  shapeDrift?: ShapeDriftObservation
  motionDrift?: MotionDriftObservation
}

export function DriftDisplay({ shapeDrift, motionDrift }: DriftDisplayProps) {
  if (!shapeDrift && !motionDrift) {
    return null
  }

  return (
    <div className="mt-8">
      <h3
        className="text-sm mb-4 tracking-wide uppercase opacity-60"
        style={{ color: 'var(--grove-text-muted)' }}
      >
        Observed Drift
      </h3>
      <div className="space-y-3">
        {shapeDrift?.descriptions.map((desc, i) => (
          <p
            key={`shape-${i}`}
            className="text-sm"
            style={{ color: 'var(--grove-text-muted)' }}
          >
            {desc}
          </p>
        ))}
        {motionDrift && (
          <p
            className="text-sm"
            style={{ color: 'var(--grove-text-muted)' }}
          >
            {motionDrift.description}
          </p>
        )}
      </div>
    </div>
  )
}
