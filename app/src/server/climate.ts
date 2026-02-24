import { CLIMATES } from '@grove/core'
import type { Climate } from '@grove/core'
import { createServerFn } from '@tanstack/react-start'

import { getCurrentClimate, persistClimate } from './db'
import { getStewardIdentity } from './identity'

export const getClimate = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Climate | undefined> => {
    const identity = await getStewardIdentity()
    if (!identity) return undefined
    return getCurrentClimate(identity.id)
  },
)

export const declareClimate = createServerFn({ method: 'POST' })
  .inputValidator((data: { climate: Climate }) => {
    if (!CLIMATES.includes(data.climate)) {
      throw new Error(`Invalid climate: ${data.climate}`)
    }
    return data
  })
  .handler(async ({ data }) => {
    const identity = await getStewardIdentity()

    if (!identity) {
      throw new Error('Not authenticated')
    }

    persistClimate(data.climate, identity.id, identity.login)
    return { climate: data.climate }
  })
