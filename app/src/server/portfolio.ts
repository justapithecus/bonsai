import type { Portfolio, RepositoryEcology } from '@grove/core'
import {
  observeConsolidationInterval,
  observeStructuralDensity,
} from '@grove/core'
import {
  classifyRepository,
  fetchStructuralSignals,
  fetchUserRepos,
} from '@grove/github'
import { createServerFn } from '@tanstack/react-start'

import { isSessionConfigured, useGroveSession } from './session'

const BATCH_SIZE = 10

/**
 * Load and classify all repositories for the authenticated user.
 * Fetches .grove.yaml concurrently in batches, then enriches
 * classified repos with structural signals and density.
 */
export const loadPortfolio = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Portfolio> => {
    if (!isSessionConfigured()) {
      return { repositories: [] }
    }

    const session = await useGroveSession()
    const token = session.data.githubToken

    if (!token) {
      return { repositories: [] }
    }

    const repos = await fetchUserRepos(token)

    // Phase 1: Classify in batches
    const classified: RepositoryEcology[] = []
    for (let i = 0; i < repos.length; i += BATCH_SIZE) {
      const batch = repos.slice(i, i + BATCH_SIZE)
      const results = await Promise.all(
        batch.map((repo) => classifyRepository(token, repo)),
      )
      classified.push(...results)
    }

    // Phase 2: Enrich classified repos with structural signals
    const ecosystemRepoNames = repos.map((r) => r.full_name)
    const reposByName = new Map(repos.map((r) => [r.full_name, r]))

    // Collect only classified repos for signal fetching, preserving indices
    const classifiedIndices: number[] = []
    for (let i = 0; i < classified.length; i++) {
      if (classified[i]!.classified) classifiedIndices.push(i)
    }

    // Fetch signals in batches for classified repos only
    const densityByName = new Map<string, ReturnType<typeof observeStructuralDensity>>()

    for (let i = 0; i < classifiedIndices.length; i += BATCH_SIZE) {
      const batchIndices = classifiedIndices.slice(i, i + BATCH_SIZE)
      const signalResults = await Promise.all(
        batchIndices.map((idx) => {
          const ecology = classified[idx]!
          const repo = reposByName.get(ecology.fullName)
          if (!repo) return Promise.resolve(undefined)
          return fetchStructuralSignals(
            token,
            ecology.fullName,
            repo.default_branch,
            ecosystemRepoNames,
          )
        }),
      )

      for (let j = 0; j < batchIndices.length; j++) {
        const ecology = classified[batchIndices[j]!]!
        const signals = signalResults[j]
        if (!signals) continue

        // Observe consolidation for density computation
        const repo = reposByName.get(ecology.fullName)
        const lastActivityDate = repo?.pushed_at
          ? new Date(repo.pushed_at)
          : undefined
        const consolidation = observeConsolidationInterval(
          ecology.declaration?.consolidation_interval_days,
          lastActivityDate,
        )

        densityByName.set(ecology.fullName, observeStructuralDensity(signals, consolidation))
      }
    }

    // Rebuild list in original order, spreading density onto classified repos
    const repositories = classified.map((ecology) => {
      const density = densityByName.get(ecology.fullName)
      return density ? { ...ecology, density } : ecology
    })

    return {
      repositories,
      climate: session.data.climate,
    }
  },
)
