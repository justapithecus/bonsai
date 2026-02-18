import { deriveSeason, parseGroveYaml } from '@grove/core'
import type { RepositoryEcology } from '@grove/core'

import { fetchGroveYaml } from './client'
import type { GitHubRepo } from './types'

/**
 * Classify a single repository by fetching and parsing its .grove.yaml.
 * Invalid or missing YAML results in an unclassified ecology (graceful degradation).
 */
export async function classifyRepository(
  token: string,
  repo: GitHubRepo,
): Promise<RepositoryEcology> {
  const raw = await fetchGroveYaml(token, repo.full_name, repo.default_branch)

  if (!raw) {
    return {
      fullName: repo.full_name,
      htmlUrl: repo.html_url,
      classified: false,
    }
  }

  const result = parseGroveYaml(raw)

  if (!result.ok) {
    return {
      fullName: repo.full_name,
      htmlUrl: repo.html_url,
      classified: false,
    }
  }

  const season = deriveSeason(result.declaration.phase)

  return {
    fullName: repo.full_name,
    htmlUrl: repo.html_url,
    declaration: result.declaration,
    season,
    classified: true,
  }
}
