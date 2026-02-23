import type {
  DensityObservation,
  Portfolio,
  RepositoryEcology,
  StructuralSignals,
} from '@grove/core'
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

import {
  getCurrentClimate,
  recordDeclarationIfChanged,
  recordSnapshotBatch,
  upsertRepositories,
} from './db'
import { getStewardIdentity, isConfigured } from './identity'

const BATCH_SIZE = 10

/**
 * Load and classify all repositories for the authenticated user.
 * Fetches .grove.yaml concurrently in batches, then enriches
 * classified repos with structural signals and density.
 */
export const loadPortfolio = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Portfolio> => {
    if (!isConfigured()) {
      return { repositories: [] }
    }

    // Resolve identity first — degrades to empty portfolio on bad/expired token
    const identity = await getStewardIdentity()
    if (!identity) {
      return { repositories: [] }
    }

    const token = identity.token
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
    const signalsByName = new Map<string, StructuralSignals>()
    const densityByName = new Map<string, DensityObservation>()

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

        signalsByName.set(ecology.fullName, signals)
        const density = observeStructuralDensity(signals, consolidation)
        if (density) densityByName.set(ecology.fullName, density)
      }
    }

    // Rebuild list in original order, spreading density onto classified repos
    const repositories = classified.map((ecology) => {
      const density = densityByName.get(ecology.fullName)
      return density ? { ...ecology, density } : ecology
    })

    // Phase 2: Persist observations to SQLite
    upsertRepositories(
      repos.map((r) => ({
        fullName: r.full_name,
        htmlUrl: r.html_url,
        defaultBranch: r.default_branch,
        pushedAt: r.pushed_at,
        sizeKb: r.size,
      })),
    )

    recordSnapshotBatch(
      repositories.map((ecology) => ({
        ecology,
        signals: signalsByName.get(ecology.fullName),
        density: densityByName.get(ecology.fullName),
      })),
    )

    for (const ecology of repositories) {
      recordDeclarationIfChanged(
        ecology.fullName,
        ecology.declaration,
        ecology.classified,
      )
    }

    return {
      repositories,
      climate: getCurrentClimate(identity.id),
    }
  },
)
