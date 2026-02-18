import { useSession } from '@tanstack/react-start/server'

import type { GroveSession } from '../utils/session'

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
