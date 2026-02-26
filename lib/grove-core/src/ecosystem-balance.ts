import type {
  Climate,
  ClimateRelation,
  Horizon,
  RepositoryEcology,
  Role,
  RoleClass,
  Season,
  Stratum,
} from './types'

/**
 * §1.1 — Derive RoleClass from declared Role.
 * Deterministic mapping per CONTRACT_ECOSYSTEM_BALANCE §1.1 table.
 */
const ROLE_TO_CLASS: Record<Role, RoleClass> = {
  infrastructure: 'foundational',
  civilizational: 'foundational',
  stewardship: 'system',
  library: 'system',
  application: 'domain',
  experiment: 'domain',
  documentation: 'domain',
}

export function deriveRoleClass(role: Role): RoleClass {
  return ROLE_TO_CLASS[role]
}

/**
 * §1.3 — Derive ClimateRelation from season and climate.
 * Deterministic lookup per CONTRACT_ECOSYSTEM_BALANCE §1.3 relation mapping matrix.
 */
const RELATION_MATRIX: Record<Climate, Record<Season, ClimateRelation>> = {
  expansion: {
    expansion: 'aligned',
    consolidation: 'orthogonal',
    pruning: 'divergent',
    dormancy: 'divergent',
  },
  consolidation: {
    expansion: 'orthogonal',
    consolidation: 'aligned',
    pruning: 'orthogonal',
    dormancy: 'divergent',
  },
  pruning: {
    expansion: 'divergent',
    consolidation: 'orthogonal',
    pruning: 'aligned',
    dormancy: 'orthogonal',
  },
  dormancy: {
    expansion: 'divergent',
    consolidation: 'divergent',
    pruning: 'orthogonal',
    dormancy: 'aligned',
  },
}

export function deriveClimateRelation(
  season: Season,
  climate: Climate,
): ClimateRelation {
  return RELATION_MATRIX[climate][season]
}

/**
 * §3 — Classify stratum from horizon and roleClass.
 * Returns undefined for seasonal horizon (no stratum assignment).
 */
export function classifyStratum(
  horizon: Horizon,
  roleClass: RoleClass,
): Stratum | undefined {
  if (horizon === 'ephemeral') return 'ephemeral_field'
  if (horizon === 'seasonal') return undefined

  // perennial or generational
  if (roleClass === 'foundational' || roleClass === 'system')
    return 'structural_core'
  return 'long_arc_domain'
}

/**
 * Convenience: classify a repository into roleClass and stratum.
 * Returns undefined if horizon or role is undeclared (§3 Unclassified).
 */
export function classifyRepository(
  repo: RepositoryEcology,
): { roleClass: RoleClass; stratum: Stratum } | undefined {
  const horizon = repo.declaration?.horizon
  const role = repo.declaration?.role
  if (!horizon || !role) return undefined

  const roleClass = deriveRoleClass(role)
  const stratum = classifyStratum(horizon, roleClass)
  if (!stratum) return undefined

  return { roleClass, stratum }
}
