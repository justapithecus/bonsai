import { createServerFn } from '@tanstack/react-start'

import { getCurrentClimate } from './db'
import { isSessionConfigured, useGroveSession } from './session'

export const getAuthUrl = createServerFn({ method: 'GET' }).handler(
  async () => {
    const clientId = process.env.GITHUB_CLIENT_ID
    if (!clientId) {
      throw new Error('GITHUB_CLIENT_ID not configured')
    }

    // Generate CSRF state and persist in session
    const state = crypto.randomUUID()
    const session = await useGroveSession()
    await session.update({ ...session.data, oauthState: state })

    // `repo` scope is required to observe private repositories.
    // GitHub's OAuth scope model does not offer a read-only scope
    // for private repo metadata — `repo` is the narrowest scope
    // that grants visibility into private repositories.
    const params = new URLSearchParams({
      client_id: clientId,
      scope: 'read:user repo',
      state,
    })

    return `https://github.com/login/oauth/authorize?${params.toString()}`
  },
)

export const exchangeCode = createServerFn({ method: 'POST' })
  .inputValidator((data: { code: string; state: string }) => data)
  .handler(async ({ data }) => {
    // Validate CSRF state before touching the token endpoint
    const session = await useGroveSession()
    const expectedState = session.data.oauthState

    // Clear stored state regardless of outcome (single-use)
    await session.update({ ...session.data, oauthState: undefined })

    if (!expectedState || data.state !== expectedState) {
      throw new Error(
        'OAuth state mismatch — possible CSRF. Please try signing in again.',
      )
    }

    const clientId = process.env.GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      throw new Error('GitHub OAuth not configured')
    }

    // Exchange code for token
    const tokenResponse = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code: data.code,
        }),
      },
    )

    const tokenData = await tokenResponse.json()
    if (tokenData.error) {
      throw new Error(
        tokenData.error_description || 'Failed to exchange code for token',
      )
    }

    // Fetch user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/vnd.github+json',
      },
    })

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info')
    }

    const user = await userResponse.json()

    // Store credentials in session. Explicitly clear oauthState to avoid
    // reintroducing it from the stale session.data snapshot captured above.
    // user.id is GitHub's immutable numeric ID — stable across username renames.
    await session.update({
      ...session.data,
      oauthState: undefined,
      githubToken: tokenData.access_token,
      githubLogin: user.login,
      githubId: user.id,
    })

    return { login: user.login }
  })

export const getSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    if (!isSessionConfigured()) {
      return { authenticated: false, login: undefined, climate: undefined }
    }

    const session = await useGroveSession()
    const userId = session.data.githubId
    return {
      authenticated: !!session.data.githubToken,
      login: session.data.githubLogin,
      climate: userId ? getCurrentClimate(userId) : undefined,
    }
  },
)

export const logout = createServerFn({ method: 'POST' }).handler(async () => {
  const session = await useGroveSession()
  await session.update({})
  return { ok: true }
})
