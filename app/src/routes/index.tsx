import type { Climate } from '@grove/core'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'

import { ClimateBand } from '../components/ClimateBand'
import { ClimateDeclaration } from '../components/ClimateDeclaration'
import { EmptyState } from '../components/EmptyState'
import { Header } from '../components/Header'
import { PaginationControls } from '../components/PaginationControls'
import { RepoCard } from '../components/RepoCard'
import { RitualInvitation } from '../components/RitualInvitation'
import { usePagination } from '../hooks/usePagination'
import { getSession } from '../server/auth'
import { loadPortfolio } from '../server/portfolio'

export const Route = createFileRoute('/')({
  component: PortfolioPage,
  loader: async () => {
    const [session, portfolio] = await Promise.all([
      getSession(),
      loadPortfolio(),
    ])
    return { session, portfolio }
  },
})

function PortfolioPage() {
  const { session, portfolio } = Route.useLoaderData()
  const [showClimatePanel, setShowClimatePanel] = useState(false)
  const [climate, setClimate] = useState<Climate | undefined>(
    portfolio.climate,
  )
  const { page, totalPages, paginated, setPage } = usePagination(
    portfolio.repositories,
  )

  if (!session.authenticated) {
    return (
      <div style={{ backgroundColor: 'var(--grove-bg)', minHeight: '100vh' }}>
        <Header />
        <EmptyState />
      </div>
    )
  }

  // Determine atmosphere from portfolio climate
  const seasonAttr = climate ?? undefined

  return (
    <div
      data-season={seasonAttr}
      style={{ backgroundColor: 'var(--grove-bg)', minHeight: '100vh' }}
    >
      <Header login={session.login} />
      <ClimateBand
        climate={climate}
        onOpenDeclaration={() => setShowClimatePanel(true)}
      />

      {showClimatePanel && (
        <ClimateDeclaration
          currentClimate={climate}
          onClose={() => setShowClimatePanel(false)}
          onDeclared={(declared) => {
            setClimate(declared)
            setShowClimatePanel(false)
          }}
        />
      )}

      <main className="px-8 py-6">
        {portfolio.repositories.length === 0 ? (
          <p
            className="text-center text-sm py-12"
            style={{ color: 'var(--grove-text-muted)' }}
          >
            No repositories with <code>.grove.yaml</code> observed.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginated.map((repo) => (
                <RepoCard
                  key={repo.fullName}
                  repo={repo}
                  climate={climate}
                />
              ))}
            </div>
            <PaginationControls
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}

        {portfolio.ecosystemInvitations.length > 0 && (
          <div className="mt-8">
            <h3
              className="text-sm mb-4 tracking-wide uppercase opacity-60"
              style={{ color: 'var(--grove-text-muted)' }}
            >
              Ritual Invitations
            </h3>
            <div className="space-y-3">
              {portfolio.ecosystemInvitations.map((invitation) => (
                <RitualInvitation
                  key={invitation.ritual}
                  invitation={invitation}
                />
              ))}
            </div>
          </div>
        )}

        {portfolio.unclassified.length > 0 && (
          <div className="mt-12">
            <Link
              to="/unclassified"
              className="text-sm"
              style={{ color: 'var(--grove-text-muted)' }}
            >
              {portfolio.unclassified.length} unclassified{' '}
              {portfolio.unclassified.length === 1
                ? 'repository'
                : 'repositories'}{' '}
              observed &rarr;
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
