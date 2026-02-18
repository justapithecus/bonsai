import type { RepositoryEcology } from '@grove/core'
import {
  observeConsolidationInterval,
  surfaceRitualInvitations,
} from '@grove/core'
import { Link, createFileRoute } from '@tanstack/react-router'

import { ConsolidationDisplay } from '../components/ConsolidationDisplay'
import { Header } from '../components/Header'
import { PhaseIndicator } from '../components/PhaseIndicator'
import { RitualInvitation } from '../components/RitualInvitation'

// --- Sample data ---

const DEMO_REPOSITORIES: RepositoryEcology[] = [
  {
    fullName: 'justapithecus/grove',
    htmlUrl: 'https://github.com/justapithecus/grove',
    classified: true,
    declaration: {
      intent:
        'A stewardship engine for long-running software ecosystems that surfaces structural integrity and temporal rhythm without optimizing for velocity.',
      horizon: 'perennial',
      role: 'stewardship',
      phase: 'expanding',
      steward: 'Andrew',
      consolidation_interval_days: 120,
    },
    season: { season: 'expansion', sourcePhase: 'expanding' },
  },
  {
    fullName: 'justapithecus/lode',
    htmlUrl: 'https://github.com/justapithecus/lode',
    classified: true,
    declaration: {
      intent:
        'A foundational infrastructure layer for long-lived configuration and dependency management.',
      horizon: 'civilizational',
      role: 'infrastructure',
      phase: 'consolidating',
      steward: 'Andrew',
      consolidation_interval_days: 90,
    },
    season: { season: 'consolidation', sourcePhase: 'consolidating' },
  },
  {
    fullName: 'justapithecus/ephemeron',
    htmlUrl: 'https://github.com/justapithecus/ephemeron',
    classified: true,
    declaration: {
      intent:
        'A short-lived experiment exploring reactive state synchronization patterns.',
      phase: 'emerging',
    },
    season: { season: 'expansion', sourcePhase: 'emerging' },
  },
  {
    fullName: 'justapithecus/still-water',
    htmlUrl: 'https://github.com/justapithecus/still-water',
    classified: true,
    declaration: {
      intent:
        'A utility library for immutable data transformations, currently at rest.',
      horizon: 'perennial',
      role: 'library',
      phase: 'resting',
      steward: 'Andrew',
      consolidation_interval_days: 180,
    },
    season: {
      season: 'dormancy',
      sourcePhase: 'resting',
      dormancyMode: 'hibernation',
    },
  },
  {
    fullName: 'justapithecus/codename',
    htmlUrl: 'https://github.com/justapithecus/codename',
    classified: false,
  },
]

// Simulated last-activity dates for consolidation observation
const DEMO_LAST_ACTIVITY: Record<string, Date> = {
  'justapithecus/grove': new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
  'justapithecus/lode': new Date(Date.now() - 135 * 24 * 60 * 60 * 1000),
  'justapithecus/ephemeron': new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  'justapithecus/still-water': new Date(
    Date.now() - 200 * 24 * 60 * 60 * 1000,
  ),
  'justapithecus/codename': new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
}

// --- Route ---

export const Route = createFileRoute('/demo/repo/$owner/$name')({
  component: DemoRepositoryDetailPage,
})

function DemoRepositoryDetailPage() {
  const { owner, name } = Route.useParams()
  const fullName = `${owner}/${name}`

  const ecology = DEMO_REPOSITORIES.find((r) => r.fullName === fullName)

  if (!ecology) {
    return (
      <div style={{ backgroundColor: 'var(--grove-bg)', minHeight: '100vh' }}>
        <Header login="Demo" />
        <main className="px-8 py-8">
          <Link
            to="/demo"
            className="text-sm mb-6 inline-block"
            style={{ color: 'var(--grove-text-muted)' }}
          >
            &larr; Portfolio
          </Link>
          <p
            className="text-sm"
            style={{ color: 'var(--grove-text-muted)' }}
          >
            Repository not found in demo data.
          </p>
        </main>
      </div>
    )
  }

  // Compute consolidation + rituals using grove-core
  const consolidation = observeConsolidationInterval(
    ecology.declaration?.consolidation_interval_days,
    DEMO_LAST_ACTIVITY[fullName],
  )

  const ritualInvitations = surfaceRitualInvitations(
    ecology.declaration,
    consolidation,
  )

  const seasonAttr = ecology.season?.season

  return (
    <div
      data-season={seasonAttr}
      style={{ backgroundColor: 'var(--grove-bg)', minHeight: '100vh' }}
    >
      <Header login="Demo" />

      <main className="px-8 py-8 max-w-3xl">
        <Link
          to="/demo"
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

        {ecology.declaration && (
          <div className="space-y-6 mt-6">
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
      </main>
    </div>
  )
}
