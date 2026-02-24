/**
 * Steward identity resolved from a GitHub Personal Access Token.
 *
 * Replaces the OAuth session stack with a single GROVE_GITHUB_TOKEN env var.
 * Identity is fetched once from the GitHub API and cached in-memory
 * for the process lifetime.
 */

export interface StewardIdentity {
  token: string
  login: string
  id: number
}

let cached: StewardIdentity | undefined

/** Read the GROVE_GITHUB_TOKEN env var. */
export function getToken(): string | undefined {
  return process.env.GROVE_GITHUB_TOKEN
}

/** True when GROVE_GITHUB_TOKEN is set in the environment. */
export function isConfigured(): boolean {
  return !!process.env.GROVE_GITHUB_TOKEN
}

/**
 * Resolve the steward's GitHub identity from the configured token.
 * Fetches `https://api.github.com/user` once, then caches the result
 * in a module-level singleton for the process lifetime.
 *
 * Returns undefined when no token is configured or when the token
 * is invalid/expired — callers degrade to the unauthenticated state
 * rather than crashing route loaders.
 */
export async function getStewardIdentity(): Promise<
  StewardIdentity | undefined
> {
  const token = getToken()
  if (!token) return undefined

  if (cached && cached.token === token) return cached

  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    })

    if (!response.ok) {
      console.warn(
        `[grove] GitHub identity check failed (${response.status}). Check that GROVE_GITHUB_TOKEN is valid.`,
      )
      return undefined
    }

    const user = await response.json()

    cached = { token, login: user.login, id: user.id }
    return cached
  } catch (err) {
    console.warn('[grove] Failed to reach GitHub API:', err)
    return undefined
  }
}
