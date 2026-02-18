import type {
  Climate,
  ConsolidationObservation,
  GroveDeclaration,
  RepositoryEcology,
  RitualInvitation,
} from './types'

/**
 * Surface ritual invitations for a single repository.
 * Language is observational — invitations, not obligations.
 */
export function surfaceRitualInvitations(
  declaration: GroveDeclaration | undefined,
  consolidation: ConsolidationObservation | undefined,
): RitualInvitation[] {
  const invitations: RitualInvitation[] = []

  // Consolidation: eligible when declared interval has elapsed
  if (consolidation?.elapsed) {
    invitations.push({
      ritual: 'consolidation',
      observation: `The declared consolidation interval of ${consolidation.intervalDays} days has elapsed. This project may be ready for a consolidation review.`,
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
        observation: `${undeclaredCount} ecology fields remain undeclared. This project may benefit from revisiting its declared intent.`,
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
    invitations.push({
      ritual: 'ecosystem_balance',
      observation: `${tensionCount} of ${classifiedWithSeason.length} classified repositories have a derived season that diverges from the declared climate. The portfolio may be ready for an ecosystem balance review.`,
    })
  }

  return invitations
}
