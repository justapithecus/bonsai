import { createFileRoute, Link } from '@tanstack/react-router'

import { EmptyState } from '../components/EmptyState'
import { Header } from '../components/Header'
import { RepoCard } from '../components/RepoCard'
import { getSession } from '../server/auth'
import { loadPortfolio } from '../server/portfolio'

export const Route = createFileRoute('/unclassified')({
  component: UnclassifiedPage,
  loader: async () => {
    const [session, portfolio] = await Promise.all([
      getSession(),
      loadPortfolio(),
    ])
    return { session, portfolio }
  },
})

function UnclassifiedPage() {
  const { session, portfolio } = Route.useLoaderData()

  if (!session.authenticated) {
    return (
      <div style={{ backgroundColor: 'var(--grove-bg)', minHeight: '100vh' }}>
        <Header />
        <EmptyState />
      </div>
    )
  }

  const seasonAttr = portfolio.climate ?? undefined

  return (
    <div
      data-season={seasonAttr}
      style={{ backgroundColor: 'var(--grove-bg)', minHeight: '100vh' }}
    >
      <Header login={session.login} />

      <main className="px-8 py-8 max-w-6xl">
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
          Unclassified repositories
        </h2>
        <p
          className="text-sm mb-6"
          style={{ color: 'var(--grove-text-muted)' }}
        >
          These repositories have no <code>.grove.yaml</code>. They are observed
          but not yet part of the declared ecosystem.
        </p>

        {portfolio.unclassified.length === 0 ? (
          <p
            className="text-center text-sm py-12"
            style={{ color: 'var(--grove-text-muted)' }}
          >
            No unclassified repositories observed.
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {portfolio.unclassified.map((repo) => (
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
