import { useSession } from '@tanstack/react-start/server'

import type { GroveSession } from '../utils/session'

/**
 * Returns true when SESSION_SECRET is configured.
 * Read-only server functions that run on every page load should
 * check this before calling useGroveSession() so the app remains
 * usable without OAuth configured (e.g. /demo, local dev).
 */
export function isSessionConfigured(): boolean {
  return !!process.env.SESSION_SECRET
}

export function useGroveSession() {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error(
      'SESSION_SECRET environment variable is required. Set it to a random string of at least 32 characters.',
    )
  }

  return useSession<GroveSession>({
    password: secret,
  })
}
