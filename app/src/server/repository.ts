import {
  observeConsolidationInterval,
  surfaceRitualInvitations,
} from '@grove/core'
import type {
  ConsolidationObservation,
  RepositoryEcology,
  RitualInvitation,
} from '@grove/core'
import { classifyRepository, fetchRepository } from '@grove/github'
import { createServerFn } from '@tanstack/react-start'

import { useGroveSession } from './session'

export interface RepositoryDetail {
  ecology: RepositoryEcology
  consolidation?: ConsolidationObservation
  ritualInvitations: RitualInvitation[]
}

export const loadRepository = createServerFn({ method: 'GET' })
  .inputValidator((data: { owner: string; name: string }) => data)
  .handler(async ({ data }): Promise<RepositoryDetail> => {
    const session = await useGroveSession()
    const token = session.data.githubToken

    if (!token) {
      throw new Error('Not authenticated')
    }

    const fullName = `${data.owner}/${data.name}`
    const repo = await fetchRepository(token, fullName)

    const ecology = await classifyRepository(token, repo)

    // Observe consolidation interval
    const lastActivityDate = repo.pushed_at
      ? new Date(repo.pushed_at)
      : undefined
    const consolidation = observeConsolidationInterval(
      ecology.declaration?.consolidation_interval_days,
      lastActivityDate,
    )

    // Surface ritual invitations
    const ritualInvitations = surfaceRitualInvitations(
      ecology.declaration,
      consolidation,
    )

    return {
      ecology,
      consolidation,
      ritualInvitations,
    }
  })
