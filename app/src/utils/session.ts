export interface GroveSession {
  githubToken?: string
  githubLogin?: string
  /** Immutable GitHub user ID — stable across username changes. */
  githubId?: number
  oauthState?: string
}
