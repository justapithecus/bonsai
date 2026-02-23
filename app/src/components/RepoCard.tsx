import type { Climate, RepositoryEcology } from '@grove/core'
import { Link } from '@tanstack/react-router'

interface RepoCardProps {
  repo: RepositoryEcology
  climate?: Climate
}

export function RepoCard({ repo, climate }: RepoCardProps) {
  const [owner, name] = repo.fullName.split('/')

  // Climate/season tension
  const hasTension =
    climate && repo.season && repo.season.season !== climate

  return (
    <Link
      to="/repo/$owner/$name"
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
          {repo.density && (
            <Field
              label="Structure"
              value={repo.density.tier.replace(/_/g, ' ')}
            />
          )}
        </div>
      )}

      {hasTension && (
        <p
          className="text-xs mt-3 italic"
          style={{ color: 'var(--grove-text-muted)' }}
        >
          This project&apos;s derived season ({repo.season!.season}) appears
          in tension with the declared climate ({climate}).
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
