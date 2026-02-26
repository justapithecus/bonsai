// Ecology enumerations — const arrays for runtime validation + types

export const HORIZONS = [
  'ephemeral',
  'seasonal',
  'perennial',
  'generational',
] as const
export type Horizon = (typeof HORIZONS)[number]

export const PHASES = [
  'emerging',
  'expanding',
  'consolidating',
  'pruning',
  'resting',
  'archival',
] as const
export type Phase = (typeof PHASES)[number]

export const ROLES = [
  'infrastructure',
  'application',
  'library',
  'experiment',
  'documentation',
  'stewardship',
  'civilizational',
] as const
export type Role = (typeof ROLES)[number]

export const SEASONS = [
  'expansion',
  'consolidation',
  'pruning',
  'dormancy',
] as const
export type Season = (typeof SEASONS)[number]

export const CLIMATES = SEASONS
export type Climate = Season

export const DORMANCY_MODES = ['hibernation', 'survival'] as const
export type DormancyMode = (typeof DORMANCY_MODES)[number]

export const RITUALS = [
  'consolidation',
  'stewardship_reaffirmation',
  'intent_redeclaration',
  'ecosystem_balance',
] as const
export type Ritual = (typeof RITUALS)[number]

// §1.1 — derived from declared Role
export const ROLE_CLASSES = ['foundational', 'system', 'domain'] as const
export type RoleClass = (typeof ROLE_CLASSES)[number]

// §1.2 — categorical relation between season and climate
export const CLIMATE_RELATIONS = ['aligned', 'divergent', 'orthogonal'] as const
export type ClimateRelation = (typeof CLIMATE_RELATIONS)[number]

// §3 — structural strata
export const STRATA = ['structural_core', 'long_arc_domain', 'ephemeral_field'] as const
export type Stratum = (typeof STRATA)[number]

// §2.2 — categorical reason for climate proposal
export const PROPOSAL_BASES = [
  'sustained_core_divergence',
  'long_arc_alignment',
  'density_drift_upward',
  'density_drift_downward',
  'mixed_transition',
] as const
export type ProposalBasis = (typeof PROPOSAL_BASES)[number]

// §2.1 — climate state union
export type ClimateState =
  | { kind: 'undefined' }
  | { kind: 'declared'; climate: Climate }
  | { kind: 'proposed'; climate: Climate; basis: ProposalBasis }

// Parsed .grove.yaml — missing optionals are undefined ("unknown")
export interface GroveDeclaration {
  intent: string
  horizon?: Horizon
  role?: Role
  phase?: Phase
  steward?: string
  consolidation_interval_days?: number
}

// Transparent season derivation
export interface SeasonDerivation {
  season: Season
  sourcePhase: Phase
  dormancyMode?: DormancyMode
}

// Consolidation interval observation
export interface ConsolidationObservation {
  intervalDays: number
  daysSinceActivity: number
  elapsed: boolean
}

// Ritual invitation — observation string uses observational language
export interface RitualInvitation {
  ritual: Ritual
  observation: string
}

// Phase duration observation
export interface PhaseDurationObservation {
  phase: Phase
  declaredAt: string // ISO 8601
  daysSinceDeclared: number
  horizon?: Horizon // context for threshold interpretation
}

// Climate/season tension
export interface ClimateTension {
  fullName: string
  climate: Climate
  season: Season
}

// Density tiers — observational, not evaluative
export const DENSITY_TIERS = [
  'sparse',
  'rooting',
  'thickening',
  'dense_canopy',
  'tangled_thicket',
] as const
export type DensityTier = (typeof DENSITY_TIERS)[number]

/** Observed structural signals — all optional, absence is valid */
export interface StructuralSignals {
  fileCount?: number
  commitsLast30d?: number
  commitsLast90d?: number
  dependencyManifestsObserved?: string[]
  ecosystemDependencyCount?: number
  observedAt: string // ISO 8601
}

/** Derived density observation — descriptive tier, not a score */
export interface DensityObservation {
  tier: DensityTier
  description: string
  signals: StructuralSignals
}

/** Structural signals captured at reference time (subset of StructuralSignals) */
export interface ReferenceSnapshot {
  fileCount?: number
  ecosystemDependencyCount?: number
  densityTier?: DensityTier
  observedAt: string // ISO 8601
}

/** Shape drift observation — factual structural comparison */
export interface ShapeDriftObservation {
  referenceSnapshot: ReferenceSnapshot
  currentFileCount?: number
  currentEcosystemDependencyCount?: number
  currentDensityTier?: DensityTier
  descriptions: string[] // 0–N observational sentences
}

/** Motion drift observation — tension between phase and cadence */
export interface MotionDriftObservation {
  phase: Phase
  commitsLast30d?: number
  commitsLast90d?: number
  description: string // single observational sentence
}

// Classified repository
export interface RepositoryEcology {
  fullName: string
  htmlUrl: string
  declaration?: GroveDeclaration
  season?: SeasonDerivation
  density?: DensityObservation
  classified: boolean
}

// Portfolio
export interface Portfolio {
  repositories: RepositoryEcology[]
  unclassified: RepositoryEcology[]
  climate?: Climate
}
