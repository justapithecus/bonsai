import { CLIMATES } from '@grove/core'
import type { Climate } from '@grove/core'
import { createServerFn } from '@tanstack/react-start'

import {
  acceptProposal as acceptProposalDb,
  dismissProposal as dismissProposalDb,
  getActiveProposal,
  getCurrentClimate,
  persistClimate,
} from './db'
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

/**
 * Accept a climate proposal — confirms the proposed climate as a declaration.
 * Accepts the proposal record and persists the climate declaration atomically.
 */
export const acceptClimateProposal = createServerFn({ method: 'POST' })
  .handler(async () => {
    const identity = await getStewardIdentity()
    if (!identity) throw new Error('Not authenticated')

    const active = getActiveProposal()
    if (!active) throw new Error('No active proposal')

    // Accept proposal and persist climate declaration
    acceptProposalDb(active.id)
    persistClimate(active.climate as Climate, identity.id, identity.login)

    return { climate: active.climate as Climate }
  })

/**
 * Dismiss a climate proposal — steward declines the suggestion.
 * The proposal is marked dismissed. Grove may re-propose if the pattern persists.
 */
export const dismissClimateProposal = createServerFn({ method: 'POST' })
  .handler(async () => {
    const identity = await getStewardIdentity()
    if (!identity) throw new Error('Not authenticated')

    const active = getActiveProposal()
    if (!active) throw new Error('No active proposal')

    dismissProposalDb(active.id)
    return { dismissed: true }
  })
