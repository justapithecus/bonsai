import { createServerFn } from '@tanstack/react-start'

import { getCurrentClimate } from './db'
import { getStewardIdentity, isConfigured } from './identity'

export const getSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    if (!isConfigured()) {
      return { authenticated: false, login: undefined, climate: undefined }
    }

    const identity = await getStewardIdentity()
    if (!identity) {
      return { authenticated: false, login: undefined, climate: undefined }
    }

    return {
      authenticated: true,
      login: identity.login,
      climate: getCurrentClimate(identity.id),
    }
  },
)
