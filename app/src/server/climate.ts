import { CLIMATES } from '@grove/core'
import type { Climate } from '@grove/core'
import { createServerFn } from '@tanstack/react-start'

import { useGroveSession } from './session'

export const getClimate = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Climate | undefined> => {
    const session = await useGroveSession()
    return session.data.climate
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
    await session.update({
      ...session.data,
      climate: data.climate,
    })
    return { climate: data.climate }
  })
