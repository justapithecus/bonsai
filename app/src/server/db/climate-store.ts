import type { Climate } from '@grove/core'
import { desc, eq } from 'drizzle-orm'

import type { GroveDb } from './client'
import { getDb } from './client'
import { climateDeclarations } from './schema'

/**
 * Persist a climate declaration (append-only).
 * Climate is portfolio-scoped — `declaredBy` identifies the steward.
 */
export function persistClimate(
  climate: Climate,
  declaredBy: string,
  db: GroveDb = getDb(),
) {
  db.insert(climateDeclarations)
    .values({
      climate,
      declaredAt: new Date().toISOString(),
      declaredBy,
    })
    .run()
}

/**
 * Get the most recent climate declaration for a steward,
 * or undefined if none exists.
 */
export function getCurrentClimate(
  login: string,
  db: GroveDb = getDb(),
): Climate | undefined {
  const row = db
    .select()
    .from(climateDeclarations)
    .where(eq(climateDeclarations.declaredBy, login))
    .orderBy(desc(climateDeclarations.id))
    .limit(1)
    .get()

  return row?.climate as Climate | undefined
}

/**
 * Get climate declaration history for a steward, ordered most recent first.
 */
export function getClimateHistory(
  login: string,
  limit = 100,
  db: GroveDb = getDb(),
) {
  return db
    .select()
    .from(climateDeclarations)
    .where(eq(climateDeclarations.declaredBy, login))
    .orderBy(desc(climateDeclarations.id))
    .limit(limit)
    .all()
}
