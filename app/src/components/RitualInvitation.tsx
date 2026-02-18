import type { RitualInvitation as RitualInvitationType } from '@grove/core'

const RITUAL_LABELS: Record<string, string> = {
  consolidation: 'Consolidation',
  stewardship_reaffirmation: 'Stewardship Reaffirmation',
  intent_redeclaration: 'Intent Re-Declaration',
  ecosystem_balance: 'Ecosystem Balance',
}

interface RitualInvitationProps {
  invitation: RitualInvitationType
}

export function RitualInvitation({ invitation }: RitualInvitationProps) {
  const label = RITUAL_LABELS[invitation.ritual] ?? invitation.ritual

  return (
    <div
      className="p-4 rounded-lg text-sm"
      style={{
        backgroundColor: 'var(--grove-surface)',
        border: '1px solid var(--grove-border)',
      }}
    >
      <div
        className="text-xs mb-2 tracking-wide uppercase opacity-60"
        style={{ color: 'var(--grove-text-muted)' }}
      >
        {label}
      </div>
      <p style={{ color: 'var(--grove-text-muted)' }}>
        {invitation.observation}
      </p>
      {/* No accept/dismiss/complete buttons — rituals are invitations, not tasks */}
    </div>
  )
}
