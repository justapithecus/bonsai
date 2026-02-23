// Ecology enumerations — const arrays for runtime validation + types

export const HORIZONS = [
  'ephemeral',
  'seasonal',
  'perennial',
  'civilizational',
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
  climate?: Climate
}
