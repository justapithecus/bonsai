import { createFileRoute, Link } from '@tanstack/react-router'

import { ConsolidationDisplay } from '../components/ConsolidationDisplay'
import { DensityDisplay } from '../components/DensityDisplay'
import { Header } from '../components/Header'
import { StructuralTimeline } from '../components/StructuralTimeline'
import { PhaseIndicator } from '../components/PhaseIndicator'
import { RitualInvitation } from '../components/RitualInvitation'
import { getSession } from '../server/auth'
import { loadRepository } from '../server/repository'

export const Route = createFileRoute('/repo/$owner/$name')({
  component: RepositoryDetailPage,
  loader: async ({ params }) => {
    const [session, detail] = await Promise.all([
      getSession(),
      loadRepository({
        data: { owner: params.owner, name: params.name },
      }),
    ])
    return { session, detail }
  },
})

function RepositoryDetailPage() {
  const { session, detail } = Route.useLoaderData()
  const { ecology, consolidation, phaseDuration, ritualInvitations, timeline } = detail

  const seasonAttr = ecology.season?.season

  return (
    <div
      data-season={seasonAttr}
      style={{ backgroundColor: 'var(--grove-bg)', minHeight: '100vh' }}
    >
      <Header login={session.login} />

      <main className="px-8 py-8">
        <Link
          to="/"
          className="text-sm mb-6 inline-block"
          style={{ color: 'var(--grove-text-muted)' }}
        >
          &larr; Portfolio
        </Link>

        <h2
          className="text-xl mb-2"
          style={{
            fontFamily: 'var(--grove-font-display)',
            color: 'var(--grove-text)',
          }}
        >
          {ecology.fullName}
        </h2>

        {!ecology.classified && (
          <p
            className="text-sm mb-6"
            style={{ color: 'var(--grove-text-muted)' }}
          >
            Unclassified — no .grove.yaml observed.
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,20rem)] gap-x-12 gap-y-8 mt-6">
          {/* Left column — ecology details + ritual invitations */}
          <div className="max-w-xl">
            {ecology.declaration && (
              <div className="space-y-6">
                {/* Intent */}
                <div>
                  <div
                    className="text-sm"
                    style={{ color: 'var(--grove-text)' }}
                  >
                    <span
                      className="opacity-60"
                      style={{ color: 'var(--grove-text-muted)' }}
                    >
                      Intent:
                    </span>{' '}
                    {ecology.declaration.intent}
                  </div>
                </div>

                {/* Phase + Season */}
                <PhaseIndicator
                  phase={ecology.declaration.phase}
                  season={ecology.season}
                  phaseDuration={phaseDuration}
                />

                {/* Horizon */}
                <div className="text-sm" style={{ color: 'var(--grove-text)' }}>
                  <span
                    className="opacity-60"
                    style={{ color: 'var(--grove-text-muted)' }}
                  >
                    Horizon:
                  </span>{' '}
                  {ecology.declaration.horizon ?? 'undeclared'}
                </div>

                {/* Role */}
                <div className="text-sm" style={{ color: 'var(--grove-text)' }}>
                  <span
                    className="opacity-60"
                    style={{ color: 'var(--grove-text-muted)' }}
                  >
                    Role:
                  </span>{' '}
                  {ecology.declaration.role ?? 'undeclared'}
                </div>

                {/* Steward */}
                <div className="text-sm" style={{ color: 'var(--grove-text)' }}>
                  <span
                    className="opacity-60"
                    style={{ color: 'var(--grove-text-muted)' }}
                  >
                    Steward:
                  </span>{' '}
                  {ecology.declaration.steward ?? 'undeclared'}
                </div>

                {/* Consolidation */}
                <ConsolidationDisplay consolidation={consolidation} />

                {/* Structural density */}
                <DensityDisplay density={ecology.density} />
              </div>
            )}

            {/* Ritual invitations */}
            {ritualInvitations.length > 0 && (
              <div className="mt-8">
                <h3
                  className="text-sm mb-4 tracking-wide uppercase opacity-60"
                  style={{ color: 'var(--grove-text-muted)' }}
                >
                  Ritual Invitations
                </h3>
                <div className="space-y-3">
                  {ritualInvitations.map((invitation) => (
                    <RitualInvitation
                      key={invitation.ritual}
                      invitation={invitation}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column — structural timeline */}
          <div>
            <StructuralTimeline timeline={timeline} />
          </div>
        </div>
      </main>
    </div>
  )
}
