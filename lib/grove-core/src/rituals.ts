import { suggestsReaffirmation } from './phase-duration'
import type {
  Climate,
  ConsolidationObservation,
  GroveDeclaration,
  PhaseDurationObservation,
  RepositoryEcology,
  RitualInvitation,
  Season,
} from './types'

/**
 * Surface ritual invitations for a single repository.
 * Language is observational — invitations, not obligations.
 */
export function surfaceRitualInvitations(
  declaration: GroveDeclaration | undefined,
  consolidation: ConsolidationObservation | undefined,
  phaseDuration?: PhaseDurationObservation,
): RitualInvitation[] {
  const invitations: RitualInvitation[] = []

  // Consolidation: eligible when declared interval has elapsed
  if (consolidation?.elapsed) {
    invitations.push({
      ritual: 'consolidation',
      observation: `The declared consolidation interval of ${consolidation.intervalDays} days has elapsed. This project may be ready for a consolidation review.`,
    })
  }

  // Stewardship reaffirmation: eligible when phase duration exceeds horizon threshold
  if (
    phaseDuration &&
    suggestsReaffirmation(
      phaseDuration,
      declaration?.consolidation_interval_days,
    )
  ) {
    invitations.push({
      ritual: 'stewardship_reaffirmation',
      observation: `The current phase "${phaseDuration.phase}" has been declared for ${phaseDuration.daysSinceDeclared} days. This duration may invite reflection on the stewardship relationship with this project.`,
    })
  }

  // Intent re-declaration: eligible when 2 or more ecology fields are undeclared
  if (declaration) {
    const undeclaredCount = [
      declaration.horizon,
      declaration.role,
      declaration.phase,
      declaration.steward,
      declaration.consolidation_interval_days,
    ].filter((v) => v === undefined).length

    if (undeclaredCount >= 2) {
      invitations.push({
        ritual: 'intent_redeclaration',
        observation: `${undeclaredCount} of 5 ecology fields are undeclared for this project.`,
      })
    }
  }

  return invitations
}

/**
 * Surface ecosystem-level ritual invitations.
 * Ecosystem Balance: eligible when climate/season tension across >= 50% of repos.
 */
export function surfaceEcosystemInvitations(
  climate: Climate | undefined,
  repositories: RepositoryEcology[],
): RitualInvitation[] {
  if (!climate) return []

  const classifiedWithSeason = repositories.filter(
    (r) => r.season !== undefined,
  )
  if (classifiedWithSeason.length === 0) return []

  const tensionCount = classifiedWithSeason.filter(
    (r) => r.season!.season !== climate,
  ).length
  const tensionRatio = tensionCount / classifiedWithSeason.length

  const invitations: RitualInvitation[] = []

  if (tensionRatio >= 0.5) {
    // Check for a dominant non-climate season (>= 60%) to provide a more
    // specific observation when one season concentrates the tension.
    const dominantObservation = findDominantSeasonObservation(
      classifiedWithSeason,
      climate,
    )

    invitations.push({
      ritual: 'ecosystem_balance',
      observation:
        dominantObservation ??
        `${tensionCount} of ${classifiedWithSeason.length} classified repositories have a derived season that diverges from the declared climate. The portfolio may be ready for an ecosystem balance review.`,
    })
  }

  return invitations
}

/**
 * If a single non-climate season accounts for >= 60% of classified repos,
 * return a more specific observation naming that season.
 * Returns undefined if no single season is dominant at 60%.
 */
function findDominantSeasonObservation(
  classifiedWithSeason: RepositoryEcology[],
  climate: Climate,
): string | undefined {
  const seasonCounts = new Map<Season, number>()
  for (const repo of classifiedWithSeason) {
    const s = repo.season!.season
    seasonCounts.set(s, (seasonCounts.get(s) ?? 0) + 1)
  }

  for (const [season, count] of seasonCounts) {
    const ratio = count / classifiedWithSeason.length
    if (ratio >= 0.6 && season !== climate) {
      return `${count} of ${classifiedWithSeason.length} classified repositories share a ${season} season, which differs from the declared climate of ${climate}. This pattern may invite a climate review.`
    }
  }

  return undefined
}
