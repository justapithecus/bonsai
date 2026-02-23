import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

/**
 * Reference table — upserted on sync.
 * Tracks the last-observed state of each GitHub repository.
 */
export const repositories = sqliteTable('repositories', {
  fullName: text('full_name').primaryKey(),
  htmlUrl: text('html_url').notNull(),
  defaultBranch: text('default_branch').notNull(),
  pushedAt: text('pushed_at'),
  sizeKb: integer('size_kb'),
  lastObservedAt: text('last_observed_at').notNull(),
})

/**
 * Immutable, append-only observation history.
 * Season is never stored — it is derived from phase at read time.
 * Density tier + description are stored to preserve the observation
 * even if the algorithm changes in a future version.
 */
export const ecologySnapshots = sqliteTable(
  'ecology_snapshots',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    fullName: text('full_name')
      .notNull()
      .references(() => repositories.fullName),
    observedAt: text('observed_at').notNull(),
    classified: integer('classified', { mode: 'boolean' }).notNull(),
    // Declaration fields — all nullable (unknown is first-class)
    intent: text('intent'),
    horizon: text('horizon'),
    role: text('role'),
    phase: text('phase'),
    steward: text('steward'),
    consolidationIntervalDays: integer('consolidation_interval_days'),
    // Structural signals
    fileCount: integer('file_count'),
    commitsLast30d: integer('commits_last_30d'),
    commitsLast90d: integer('commits_last_90d'),
    dependencyManifestsObserved: text('dependency_manifests_observed'),
    ecosystemDependencyCount: integer('ecosystem_dependency_count'),
    // Density observation
    densityTier: text('density_tier'),
    densityDescription: text('density_description'),
  },
  (table) => [index('idx_snapshots_repo_time').on(table.fullName, table.observedAt)],
)

/**
 * Recorded only when a declaration differs from the previous observation.
 * Enables tracking when intent, phase, or other declarations change.
 */
export const declarationChanges = sqliteTable(
  'declaration_changes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    fullName: text('full_name')
      .notNull()
      .references(() => repositories.fullName),
    observedAt: text('observed_at').notNull(),
    classified: integer('classified', { mode: 'boolean' }).notNull(),
    // Declaration fields — all nullable
    intent: text('intent'),
    horizon: text('horizon'),
    role: text('role'),
    phase: text('phase'),
    steward: text('steward'),
    consolidationIntervalDays: integer('consolidation_interval_days'),
  },
  (table) => [index('idx_declarations_repo_time').on(table.fullName, table.observedAt)],
)

/**
 * Steward-set, append-only climate declarations.
 * Climate persists across sessions (survives logout).
 * Keyed by declared_by_id (immutable GitHub user ID) for continuity
 * across username changes. declared_by stores the login for display.
 */
export const climateDeclarations = sqliteTable('climate_declarations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  climate: text('climate').notNull(),
  declaredAt: text('declared_at').notNull(),
  declaredBy: text('declared_by'),
  declaredById: integer('declared_by_id'),
})
