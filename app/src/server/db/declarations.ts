import type { GroveDeclaration } from '@grove/core'
import { desc, eq } from 'drizzle-orm'

import type { GroveDb } from './client'
import { getDb } from './client'
import { declarationChanges } from './schema'

/**
 * Record a declaration change only if the current declaration differs
 * from the most recently stored one for this repository.
 *
 * Returns true if a new row was inserted.
 */
export function recordDeclarationIfChanged(
  fullName: string,
  declaration: GroveDeclaration | undefined,
  classified: boolean,
  db: GroveDb = getDb(),
): boolean {
  const latest = db
    .select()
    .from(declarationChanges)
    .where(eq(declarationChanges.fullName, fullName))
    .orderBy(desc(declarationChanges.id))
    .limit(1)
    .get()

  const current = serializeDeclaration(declaration, classified)
  if (latest && serializeDeclaration(rowToDeclaration(latest), latest.classified) === current) {
    return false
  }

  db.insert(declarationChanges)
    .values({
      fullName,
      observedAt: new Date().toISOString(),
      classified,
      intent: declaration?.intent ?? null,
      horizon: declaration?.horizon ?? null,
      role: declaration?.role ?? null,
      phase: declaration?.phase ?? null,
      steward: declaration?.steward ?? null,
      consolidationIntervalDays:
        declaration?.consolidation_interval_days ?? null,
    })
    .run()

  return true
}

/**
 * Get the most recent declaration change for a repository.
 */
export function getLatestDeclaration(
  fullName: string,
  db: GroveDb = getDb(),
) {
  return (
    db
      .select()
      .from(declarationChanges)
      .where(eq(declarationChanges.fullName, fullName))
      .orderBy(desc(declarationChanges.id))
      .limit(1)
      .get() ?? null
  )
}

/**
 * Get declaration change history for a repository, ordered by observed_at DESC.
 */
export function getDeclarationHistory(
  fullName: string,
  limit = 100,
  db: GroveDb = getDb(),
) {
  return db
    .select()
    .from(declarationChanges)
    .where(eq(declarationChanges.fullName, fullName))
    .orderBy(desc(declarationChanges.id))
    .limit(limit)
    .all()
}

// ── Internal helpers ──────────────────────────────────────────────

/**
 * Canonical serialization of declaration fields for change detection.
 * Sorts keys to ensure consistent comparison regardless of insertion order.
 */
function serializeDeclaration(
  declaration: GroveDeclaration | undefined,
  classified: boolean,
): string {
  return JSON.stringify({
    classified,
    consolidation_interval_days:
      declaration?.consolidation_interval_days ?? null,
    horizon: declaration?.horizon ?? null,
    intent: declaration?.intent ?? null,
    phase: declaration?.phase ?? null,
    role: declaration?.role ?? null,
    steward: declaration?.steward ?? null,
  })
}

/**
 * Convert a declaration_changes row back to a GroveDeclaration-like
 * shape for comparison purposes.
 */
function rowToDeclaration(
  row: typeof declarationChanges.$inferSelect,
): GroveDeclaration | undefined {
  if (!row.classified) return undefined

  const decl: GroveDeclaration = {
    intent: row.intent ?? '',
  }
  if (row.horizon) decl.horizon = row.horizon as GroveDeclaration['horizon']
  if (row.role) decl.role = row.role as GroveDeclaration['role']
  if (row.phase) decl.phase = row.phase as GroveDeclaration['phase']
  if (row.steward) decl.steward = row.steward
  if (row.consolidationIntervalDays != null)
    decl.consolidation_interval_days = row.consolidationIntervalDays
  return decl
}
