import { CLIMATES } from '@grove/core'
import type { Climate } from '@grove/core'
import { createServerFn } from '@tanstack/react-start'

import { getCurrentClimate, persistClimate } from './db'
import { useGroveSession } from './session'

export const getClimate = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Climate | undefined> => {
    const session = await useGroveSession()
    const userId = session.data.githubId
    if (!userId) return undefined
    return getCurrentClimate(userId)
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
    const userId = session.data.githubId

    if (!token || !login || !userId) {
      throw new Error('Not authenticated')
    }

    persistClimate(data.climate, userId, login)
    return { climate: data.climate }
  })
