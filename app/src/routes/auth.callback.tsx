import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { exchangeCode, validateOAuthState } from '../server/auth'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallbackPage,
  validateSearch: (
    search: Record<string, unknown>,
  ): { code?: string; state?: string; error?: string } => ({
    code: typeof search.code === 'string' ? search.code : undefined,
    state: typeof search.state === 'string' ? search.state : undefined,
    error: typeof search.error === 'string' ? search.error : undefined,
  }),
})

function AuthCallbackPage() {
  const { code, state, error: authError } = Route.useSearch()
  const router = useRouter()
  const [error, setError] = useState<string | undefined>(authError)

  useEffect(() => {
    if (!code || !state) {
      setError('No authorization code or state received')
      return
    }

    validateOAuthState({ data: { state } })
      .then(() => exchangeCode({ data: { code } }))
      .then(() => {
        router.navigate({ to: '/' })
      })
      .catch((err) => {
        setError(err.message || 'Authentication failed')
      })
  }, [code, state, router])

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ backgroundColor: 'var(--grove-bg)' }}
    >
      {error ? (
        <div className="text-center">
          <p className="text-sm mb-4" style={{ color: 'var(--grove-text)' }}>
            {error}
          </p>
          <a
            href="/"
            className="text-sm"
            style={{ color: 'var(--grove-accent)' }}
          >
            Return to Grove
          </a>
        </div>
      ) : (
        <p
          className="text-sm"
          style={{ color: 'var(--grove-text-muted)' }}
        >
          Connecting...
        </p>
      )}
    </div>
  )
}
