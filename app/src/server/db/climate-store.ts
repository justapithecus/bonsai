import type { Climate } from '@grove/core'
import { desc, eq } from 'drizzle-orm'

import type { GroveDb } from './client'
import { getDb } from './client'
import { climateDeclarations } from './schema'

/**
 * Persist a climate declaration (append-only).
 * Climate is portfolio-scoped — keyed by immutable GitHub user ID
 * so history survives username changes. Login stored for display.
 */
export function persistClimate(
  climate: Climate,
  userId: number,
  login: string,
  db: GroveDb = getDb(),
) {
  db.insert(climateDeclarations)
    .values({
      climate,
      declaredAt: new Date().toISOString(),
      declaredBy: login,
      declaredById: userId,
    })
    .run()
}

/**
 * Get the most recent climate declaration for a steward (by immutable user ID),
 * or undefined if none exists.
 */
export function getCurrentClimate(
  userId: number,
  db: GroveDb = getDb(),
): Climate | undefined {
  const row = db
    .select()
    .from(climateDeclarations)
    .where(eq(climateDeclarations.declaredById, userId))
    .orderBy(desc(climateDeclarations.id))
    .limit(1)
    .get()

  return row?.climate as Climate | undefined
}

/**
 * Get climate declaration history for a steward (by immutable user ID),
 * ordered most recent first.
 */
export function getClimateHistory(
  userId: number,
  limit = 100,
  db: GroveDb = getDb(),
) {
  return db
    .select()
    .from(climateDeclarations)
    .where(eq(climateDeclarations.declaredById, userId))
    .orderBy(desc(climateDeclarations.id))
    .limit(limit)
    .all()
}
