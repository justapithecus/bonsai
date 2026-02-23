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

    const enriched: RepositoryEcology[] = []
    const toEnrich = classified.filter((e) => e.classified)
    const unclassified = classified.filter((e) => !e.classified)

    for (let i = 0; i < toEnrich.length; i += BATCH_SIZE) {
      const batch = toEnrich.slice(i, i + BATCH_SIZE)
      const signalResults = await Promise.all(
        batch.map((ecology) => {
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

      for (let j = 0; j < batch.length; j++) {
        const ecology = batch[j]!
        const signals = signalResults[j]
        if (!signals) {
          enriched.push(ecology)
          continue
        }

        // Observe consolidation for density computation
        const repo = reposByName.get(ecology.fullName)
        const lastActivityDate = repo?.pushed_at
          ? new Date(repo.pushed_at)
          : undefined
        const consolidation = observeConsolidationInterval(
          ecology.declaration?.consolidation_interval_days,
          lastActivityDate,
        )

        const density = observeStructuralDensity(signals, consolidation)
        enriched.push({ ...ecology, density })
      }
    }

    return {
      repositories: [...enriched, ...unclassified],
      climate: session.data.climate,
    }
  },
)
