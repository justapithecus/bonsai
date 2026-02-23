/**
 * Steward identity resolved from a GitHub Personal Access Token.
 *
 * Replaces the OAuth session stack with a single GITHUB_TOKEN env var.
 * Identity is fetched once from the GitHub API and cached in-memory
 * for the process lifetime.
 */

export interface StewardIdentity {
  token: string
  login: string
  id: number
}

let cached: StewardIdentity | undefined

/** Read the GITHUB_TOKEN env var. */
export function getToken(): string | undefined {
  return process.env.GITHUB_TOKEN
}

/** True when GITHUB_TOKEN is set in the environment. */
export function isConfigured(): boolean {
  return !!process.env.GITHUB_TOKEN
}

/**
 * Resolve the steward's GitHub identity from the configured token.
 * Fetches `https://api.github.com/user` once, then caches the result
 * in a module-level singleton for the process lifetime.
 *
 * Returns undefined when no token is configured.
 */
export async function getStewardIdentity(): Promise<
  StewardIdentity | undefined
> {
  const token = getToken()
  if (!token) return undefined

  if (cached && cached.token === token) return cached

  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  })

  if (!response.ok) {
    throw new Error(
      `Failed to fetch GitHub user (${response.status}). Check that GITHUB_TOKEN is valid.`,
    )
  }

  const user = await response.json()

  cached = { token, login: user.login, id: user.id }
  return cached
}
