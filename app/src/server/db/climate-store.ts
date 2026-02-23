import type { Climate } from '@grove/core'
import { desc } from 'drizzle-orm'

import type { GroveDb } from './client'
import { getDb } from './client'
import { climateDeclarations } from './schema'

/**
 * Persist a climate declaration (append-only).
 */
export function persistClimate(
  climate: Climate,
  declaredBy?: string,
  db: GroveDb = getDb(),
) {
  db.insert(climateDeclarations)
    .values({
      climate,
      declaredAt: new Date().toISOString(),
      declaredBy: declaredBy ?? null,
    })
    .run()
}

/**
 * Get the most recent climate declaration, or undefined if none exists.
 */
export function getCurrentClimate(
  db: GroveDb = getDb(),
): Climate | undefined {
  const row = db
    .select()
    .from(climateDeclarations)
    .orderBy(desc(climateDeclarations.id))
    .limit(1)
    .get()

  return row?.climate as Climate | undefined
}

/**
 * Get climate declaration history, ordered most recent first.
 */
export function getClimateHistory(limit = 100, db: GroveDb = getDb()) {
  return db
    .select()
    .from(climateDeclarations)
    .orderBy(desc(climateDeclarations.id))
    .limit(limit)
    .all()
}
