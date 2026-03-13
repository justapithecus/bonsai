import type { AccessibilityObservation } from '@grove/core'

interface AccessibilityDisplayProps {
  accessibility?: AccessibilityObservation
}

export function AccessibilityDisplay({
  accessibility,
}: AccessibilityDisplayProps) {
  if (!accessibility) return null

  return (
    <div>
      <div className="text-sm" style={{ color: 'var(--grove-text)' }}>
        <span
          className="opacity-60"
          style={{ color: 'var(--grove-text-muted)' }}
        >
          Accessibility:
        </span>
      </div>

      {accessibility.impliedPrerequisites.length > 0 && (
        <div
          className="text-xs mt-2"
          style={{ color: 'var(--grove-text-muted)' }}
        >
          <span className="opacity-60">Implied prerequisites:</span>{' '}
          {accessibility.impliedPrerequisites.join(', ')}
        </div>
      )}

      {accessibility.presentArtifacts.length > 0 && (
        <div
          className="text-xs mt-1"
          style={{ color: 'var(--grove-text-muted)' }}
        >
          <span className="opacity-60">Observed:</span>{' '}
          {accessibility.presentArtifacts.join(', ')}
        </div>
      )}

      {accessibility.absentArtifacts.length > 0 && (
        <div
          className="text-xs mt-1"
          style={{ color: 'var(--grove-text-muted)' }}
        >
          <span className="opacity-60">Not observed:</span>{' '}
          {accessibility.absentArtifacts.join(', ')}
        </div>
      )}

      {accessibility.descriptions.length > 0 && (
        <div className="mt-2 space-y-1">
          {accessibility.descriptions.map((desc, i) => (
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
