import type { Climate } from '@grove/core'

export interface GroveSession {
  githubToken?: string
  githubLogin?: string
  climate?: Climate
  oauthState?: string
}
