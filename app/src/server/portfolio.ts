import type { Portfolio } from '@grove/core'
import { classifyRepository, fetchUserRepos } from '@grove/github'
import { createServerFn } from '@tanstack/react-start'

import { useGroveSession } from './session'

const BATCH_SIZE = 10

/**
 * Load and classify all repositories for the authenticated user.
 * Fetches .grove.yaml concurrently in batches.
 */
export const loadPortfolio = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Portfolio> => {
    const session = await useGroveSession()
    const token = session.data.githubToken

    if (!token) {
      return { repositories: [] }
    }

    const repos = await fetchUserRepos(token)

    // Classify in batches to avoid overwhelming the GitHub API
    const classified = []
    for (let i = 0; i < repos.length; i += BATCH_SIZE) {
      const batch = repos.slice(i, i + BATCH_SIZE)
      const results = await Promise.all(
        batch.map((repo) => classifyRepository(token, repo)),
      )
      classified.push(...results)
    }

    return {
      repositories: classified,
      climate: session.data.climate,
    }
  },
)
