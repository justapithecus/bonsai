import { CLIMATES } from '@grove/core'
import type { Climate } from '@grove/core'
import { createServerFn } from '@tanstack/react-start'

import { getCurrentClimate, persistClimate } from './db'
import { useGroveSession } from './session'

export const getClimate = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Climate | undefined> => {
    const session = await useGroveSession()
    const login = session.data.githubLogin
    if (!login) return undefined
    return getCurrentClimate(login)
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
    const session = await useGroveSession()
    const token = session.data.githubToken
    const login = session.data.githubLogin

    if (!token || !login) {
      throw new Error('Not authenticated')
    }

    persistClimate(data.climate, login)
    return { climate: data.climate }
  })
