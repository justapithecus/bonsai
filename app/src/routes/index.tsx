import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'

import { ClimateBand } from '../components/ClimateBand'
import { ClimateDeclaration } from '../components/ClimateDeclaration'
import { EmptyState } from '../components/EmptyState'
import { Header } from '../components/Header'
import { RepoCard } from '../components/RepoCard'
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
  const router = useRouter()
  const [showClimatePanel, setShowClimatePanel] = useState(false)

  if (!session.authenticated) {
    return (
      <div style={{ backgroundColor: 'var(--grove-bg)', minHeight: '100vh' }}>
        <Header />
        <EmptyState />
      </div>
    )
  }

  // Determine atmosphere from portfolio climate
  const seasonAttr = portfolio.climate ?? undefined

  return (
    <div
      data-season={seasonAttr}
      style={{ backgroundColor: 'var(--grove-bg)', minHeight: '100vh' }}
    >
      <Header login={session.login} />
      <ClimateBand
        climate={portfolio.climate}
        onOpenDeclaration={() => setShowClimatePanel(true)}
      />

      {showClimatePanel && (
        <ClimateDeclaration
          currentClimate={portfolio.climate}
          onClose={() => setShowClimatePanel(false)}
          onDeclared={() => {
            setShowClimatePanel(false)
            router.invalidate()
          }}
        />
      )}

      <main className="px-8 py-8">
        {portfolio.repositories.length === 0 ? (
          <p
            className="text-center text-sm py-12"
            style={{ color: 'var(--grove-text-muted)' }}
          >
            No repositories observed.
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-6xl">
            {portfolio.repositories.map((repo) => (
              <RepoCard
                key={repo.fullName}
                repo={repo}
                climate={portfolio.climate}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
