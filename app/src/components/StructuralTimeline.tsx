import type { TimelineEntry } from '../server/timeline'

interface StructuralTimelineProps {
  timeline: TimelineEntry[]
}

const MAX_DISPLAY = 20

const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso))
}

function formatTierName(tier: string): string {
  return tier.replace(/_/g, ' ')
}

function describeDeclarationChange(change: {
  field: string
  from: string | null
  to: string | null
}): string {
  const value = change.to
  switch (change.field) {
    case 'phase':
      return `Phase transitioned to ${value}`
    case 'intent':
      return 'Intent re-declared'
    case 'horizon':
      return `Horizon shifted to ${value}`
    case 'role':
      return `Role changed to ${value}`
    case 'steward':
      return `Stewardship transferred to ${value}`
    case 'consolidationIntervalDays':
      return `Consolidation interval adjusted to ${value} days`
    default:
      return `${change.field} changed to ${value ?? 'undeclared'}`
  }
}

export function StructuralTimeline({ timeline }: StructuralTimelineProps) {
  if (timeline.length === 0) return null

  const visible = timeline.slice(0, MAX_DISPLAY)
  const hiddenCount = timeline.length - visible.length

  return (
    <div className="mt-8">
      <h3
        className="text-sm mb-4 tracking-wide uppercase opacity-60"
        style={{ color: 'var(--grove-text-muted)' }}
      >
        Structural Timeline
      </h3>

      <div
        className="border-l pl-4"
        style={{ borderColor: 'var(--grove-border)' }}
      >
        {visible.map((entry, i) => (
          <div key={i} className="py-2">
            <TimelineEntryView entry={entry} />
          </div>
        ))}

        {hiddenCount > 0 && (
          <div
            className="py-2 text-xs"
            style={{ color: 'var(--grove-text-muted)', opacity: 0.5 }}
          >
            {hiddenCount} earlier observation{hiddenCount !== 1 ? 's' : ''} not
            shown
          </div>
        )}
      </div>
    </div>
  )
}

function TimelineEntryView({ entry }: { entry: TimelineEntry }) {
  switch (entry.kind) {
    case 'density_transition':
      return <DensityTransitionView entry={entry} />
    case 'density_span':
      return <DensitySpanView entry={entry} />
    case 'declaration_change':
      return <DeclarationChangeView entry={entry} />
  }
}

function DensityTransitionView({
  entry,
}: {
  entry: Extract<TimelineEntry, { kind: 'density_transition' }>
}) {
  const isFirst = entry.fromTier === null

  return (
    <div>
      <div
        className="text-xs opacity-60"
        style={{ color: 'var(--grove-text-muted)' }}
      >
        {formatDate(entry.observedAt)}
      </div>
      <div className="text-sm" style={{ color: 'var(--grove-text)' }}>
        {isFirst
          ? `Structural character first observed as ${formatTierName(entry.toTier)}`
          : 'Structural character shifted'}
      </div>
      {!isFirst && (
        <div
          className="text-xs"
          style={{ color: 'var(--grove-text-muted)' }}
        >
          from {formatTierName(entry.fromTier!)} to{' '}
          {formatTierName(entry.toTier)}
        </div>
      )}
      {entry.freshlyRecorded && (
        <div className="text-xs" style={{ opacity: 0.5, color: 'var(--grove-text-muted)' }}>
          Structural state recorded
        </div>
      )}
    </div>
  )
}

function DensitySpanView({
  entry,
}: {
  entry: Extract<TimelineEntry, { kind: 'density_span' }>
}) {
  return (
    <div>
      <div
        className="text-xs"
        style={{ color: 'var(--grove-text-muted)' }}
      >
        Observed as {formatTierName(entry.tier)} &mdash;{' '}
        {formatDate(entry.observedAt)} through {formatDate(entry.spanEnd)} (
        {entry.observationCount} observations)
      </div>
    </div>
  )
}

function DeclarationChangeView({
  entry,
}: {
  entry: Extract<TimelineEntry, { kind: 'declaration_change' }>
}) {
  return (
    <div>
      <div
        className="text-xs opacity-60"
        style={{ color: 'var(--grove-text-muted)' }}
      >
        {formatDate(entry.observedAt)}
      </div>
      {entry.changes.map((change, i) => (
        <div
          key={i}
          className="text-sm"
          style={{ color: 'var(--grove-text)' }}
        >
          {describeDeclarationChange(change)}
        </div>
      ))}
    </div>
  )
}
