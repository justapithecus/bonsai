import type { Climate, RepositoryEcology } from '@grove/core'
import { CLIMATES } from '@grove/core'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { ClimateBand } from '../components/ClimateBand'
import { Header } from '../components/Header'

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

const DEFAULT_CLIMATE: Climate = 'consolidation'

// --- Route ---

export const Route = createFileRoute('/demo/')({
  component: DemoPortfolioPage,
})

function DemoPortfolioPage() {
  const [climate, setClimate] = useState<Climate | undefined>(DEFAULT_CLIMATE)
  const [showClimatePanel, setShowClimatePanel] = useState(false)

  const seasonAttr = climate ?? undefined

  return (
    <div
      data-season={seasonAttr}
      style={{ backgroundColor: 'var(--grove-bg)', minHeight: '100vh' }}
    >
      <Header login="Demo" />
      <ClimateBand
        climate={climate}
        onOpenDeclaration={() => setShowClimatePanel(true)}
      />

      {showClimatePanel && (
        <DemoClimateDeclaration
          currentClimate={climate}
          onClose={() => setShowClimatePanel(false)}
          onDeclared={(newClimate) => {
            setClimate(newClimate)
            setShowClimatePanel(false)
          }}
        />
      )}

      <main className="px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-6xl">
          {DEMO_REPOSITORIES.map((repo) => (
            <DemoRepoCard key={repo.fullName} repo={repo} climate={climate} />
          ))}
        </div>
      </main>
    </div>
  )
}

// --- Demo-specific components ---

function DemoRepoCard({
  repo,
  climate,
}: {
  repo: RepositoryEcology
  climate?: Climate
}) {
  const [owner, name] = repo.fullName.split('/')

  const hasTension =
    climate && repo.season && repo.season.season !== climate

  return (
    <Link
      to="/demo/repo/$owner/$name"
      params={{ owner: owner!, name: name! }}
      className="block p-6 rounded-lg transition-colors"
      style={{
        backgroundColor: 'var(--grove-surface)',
        border: '1px solid var(--grove-border)',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <h3
          className="text-base font-medium"
          style={{ color: 'var(--grove-text)' }}
        >
          {repo.fullName}
        </h3>
        {!repo.classified && (
          <span
            className="text-xs px-2 py-0.5 rounded"
            style={{
              color: 'var(--grove-text-muted)',
              backgroundColor: 'var(--grove-bg)',
            }}
          >
            Unclassified
          </span>
        )}
      </div>

      {repo.declaration && (
        <p
          className="text-sm mb-4 leading-relaxed"
          style={{ color: 'var(--grove-text-muted)' }}
        >
          {repo.declaration.intent}
        </p>
      )}

      {repo.classified && repo.declaration && (
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
          {repo.declaration.phase && (
            <Field label="Phase" value={repo.declaration.phase} />
          )}
          {repo.season && (
            <Field
              label="Season"
              value={`${repo.season.season} (derived from ${repo.season.sourcePhase})`}
            />
          )}
          {repo.declaration.horizon && (
            <Field label="Horizon" value={repo.declaration.horizon} />
          )}
          {repo.declaration.role && (
            <Field label="Role" value={repo.declaration.role} />
          )}
          {repo.declaration.steward && (
            <Field label="Steward" value={repo.declaration.steward} />
          )}
        </div>
      )}

      {hasTension && (
        <p
          className="text-xs mt-3 italic"
          style={{ color: 'var(--grove-text-muted)' }}
        >
          This project&apos;s derived season ({repo.season!.season}) appears in
          tension with the declared climate ({climate}).
        </p>
      )}
    </Link>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <span style={{ color: 'var(--grove-text-muted)' }}>
      <span className="opacity-60">{label}:</span> {value}
    </span>
  )
}

const CLIMATE_DESCRIPTIONS: Record<Climate, string> = {
  expansion: 'Warmth, openness, new growth across the portfolio.',
  consolidation:
    'Neutrality, clarity — tightening and strengthening across projects.',
  pruning:
    'Coolness, deliberate reduction — reshaping scope across the portfolio.',
  dormancy:
    'Stillness, muted tones — intentional rest across the portfolio.',
}

function DemoClimateDeclaration({
  currentClimate,
  onClose,
  onDeclared,
}: {
  currentClimate?: Climate
  onClose: () => void
  onDeclared: (climate: Climate) => void
}) {
  const [selected, setSelected] = useState<Climate | undefined>(undefined)
  const [confirming, setConfirming] = useState(false)

  const handleSelect = (c: Climate) => {
    setSelected(c)
    setConfirming(true)
  }

  const handleConfirm = () => {
    if (!selected) return
    onDeclared(selected)
  }

  const handleCancel = () => {
    setSelected(undefined)
    setConfirming(false)
  }

  return (
    <div
      className="px-8 py-6"
      style={{
        backgroundColor: 'var(--grove-surface)',
        borderBottom: '1px solid var(--grove-border)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm" style={{ color: 'var(--grove-text)' }}>
          {confirming
            ? 'Confirm climate declaration'
            : 'Declare portfolio climate'}
        </h3>
        <button
          onClick={onClose}
          className="text-xs cursor-pointer"
          style={{ color: 'var(--grove-text-muted)' }}
        >
          Close
        </button>
      </div>

      {!confirming ? (
        <div className="flex gap-3">
          {CLIMATES.map((c) => (
            <button
              key={c}
              onClick={() => handleSelect(c)}
              className="px-4 py-2 text-sm rounded-lg cursor-pointer transition-colors"
              style={{
                backgroundColor:
                  c === currentClimate
                    ? 'var(--grove-accent)'
                    : 'var(--grove-bg)',
                color:
                  c === currentClimate
                    ? 'var(--grove-surface)'
                    : 'var(--grove-text)',
                border: '1px solid var(--grove-border)',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      ) : (
        <div>
          <p className="text-sm mb-2" style={{ color: 'var(--grove-text)' }}>
            Climate: <span className="font-medium">{selected}</span>
          </p>
          <p
            className="text-xs mb-4"
            style={{ color: 'var(--grove-text-muted)' }}
          >
            {selected && CLIMATE_DESCRIPTIONS[selected]}
          </p>
          <p
            className="text-xs mb-4"
            style={{ color: 'var(--grove-text-muted)' }}
          >
            Climate changes should be deliberate and rare. This declaration
            applies across the entire portfolio.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              className="px-4 py-2 text-sm rounded-lg cursor-pointer transition-colors"
              style={{
                backgroundColor: 'var(--grove-accent)',
                color: 'var(--grove-surface)',
              }}
            >
              Confirm declaration
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm rounded-lg cursor-pointer transition-colors"
              style={{
                color: 'var(--grove-text-muted)',
                border: '1px solid var(--grove-border)',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
