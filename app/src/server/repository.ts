import {
  observeConsolidationInterval,
  observeStructuralDensity,
  surfaceRitualInvitations,
} from '@grove/core'
import type {
  ConsolidationObservation,
  RepositoryEcology,
  RitualInvitation,
} from '@grove/core'
import {
  classifyRepository,
  fetchRepository,
  fetchStructuralSignals,
  fetchUserRepos,
} from '@grove/github'
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

    // Fetch repo + user repos in parallel for consistent entanglement detection
    const [repo, userRepos] = await Promise.all([
      fetchRepository(token, fullName),
      fetchUserRepos(token),
    ])

    const ecosystemRepoNames = userRepos.map((r) => r.full_name)

    // Classify and fetch structural signals in parallel
    const [ecology, signals] = await Promise.all([
      classifyRepository(token, repo),
      fetchStructuralSignals(
        token,
        fullName,
        repo.default_branch,
        ecosystemRepoNames,
      ),
    ])

    // Observe consolidation interval
    const lastActivityDate = repo.pushed_at
      ? new Date(repo.pushed_at)
      : undefined
    const consolidation = observeConsolidationInterval(
      ecology.declaration?.consolidation_interval_days,
      lastActivityDate,
    )

    // Derive density from structural signals
    const density = observeStructuralDensity(signals, consolidation)

    // Surface ritual invitations
    const ritualInvitations = surfaceRitualInvitations(
      ecology.declaration,
      consolidation,
    )

    return {
      ecology: { ...ecology, density },
      consolidation,
      ritualInvitations,
    }
  })
