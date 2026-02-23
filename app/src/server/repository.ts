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
    const repo = await fetchRepository(token, fullName)

    // Classify and fetch structural signals in parallel.
    // Entanglement (ecosystemRepoNames) is omitted here: it is a
    // portfolio-level signal that requires fetching all user repos,
    // which would add N-page pagination cost per detail page load.
    // The entanglement factor is weighted at 0.15 — omitting it may
    // produce a slightly lower tier than the portfolio view in rare
    // cases, but avoids disproportionate API cost for a single-repo view.
    const [ecology, signals] = await Promise.all([
      classifyRepository(token, repo),
      fetchStructuralSignals(token, fullName, repo.default_branch),
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
