import type { Climate, ClimateTension, RepositoryEcology } from './types'

/**
 * Observe tension between declared climate and derived seasons.
 * Returns tensions — repos where derived season differs from declared climate.
 */
export function observeClimateTension(
  climate: Climate | undefined,
  repositories: RepositoryEcology[],
): ClimateTension[] {
  if (!climate) return []

  return repositories
    .filter((r) => r.season !== undefined && r.season.season !== climate)
    .map((r) => ({
      fullName: r.fullName,
      climate,
      season: r.season!.season,
    }))
}
