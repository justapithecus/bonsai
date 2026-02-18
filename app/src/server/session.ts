import { useSession } from '@tanstack/react-start/server'

import type { GroveSession } from '../utils/session'

export function useGroveSession() {
  return useSession<GroveSession>({
    password:
      process.env.SESSION_SECRET ?? 'grove-dev-secret-change-in-production',
  })
}
