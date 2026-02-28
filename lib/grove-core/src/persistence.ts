import type { Climate, ClimateRelation, Phase } from './types'
import { PHASES } from './types'
import { deriveClimateRelation } from './ecosystem-balance'
import { deriveSeason } from './season'

// §4.1 — 14 daily snapshots
export const PERSISTENCE_WINDOW_SIZE = 14

// §4.2/§4.3 — 9 of 14 establishes consistency
export const PERSISTENCE_THRESHOLD = 9

export interface PersistenceAssessment {
  alignedCount: number
  divergentCount: number
  orthogonalCount: number
  undeterminedCount: number
  totalSnapshots: number
  persistentlyAligned: boolean
  persistentlyDivergent: boolean
}

/**
 * §1.3 — Derive ClimateRelation from a snapshot's stored phase string and the declared climate.
 *
 * Bridges snapshot rows (which store phase as string|null) to the typed climate relation system.
 * Returns undefined if phase is null, undefined, or not a recognized Phase value.
 */
export function deriveSnapshotRelation(
  phase: string | null | undefined,
  climate: Climate,
): ClimateRelation | undefined {
  if (phase == null) return undefined
  if (!(PHASES as readonly string[]).includes(phase)) return undefined

  const seasonDerivation = deriveSeason(phase as Phase)
  if (!seasonDerivation) return undefined

  return deriveClimateRelation(seasonDerivation.season, climate)
}

/**
 * §4.2/§4.3 — Assess persistence of climate relations across a snapshot window.
 *
 * Evaluates the first PERSISTENCE_WINDOW_SIZE entries (assumed most-recent-first).
 * If more than 14 entries are provided, only the first 14 are evaluated —
 * the contract defines persistence as "in the last 14 daily snapshots."
 *
 * A relation is persistent only when the window contains exactly
 * PERSISTENCE_WINDOW_SIZE (14) snapshots AND the count meets
 * PERSISTENCE_THRESHOLD (9). Incomplete windows never yield persistence.
 */
export function assessPersistence(
  relations: ReadonlyArray<ClimateRelation | undefined>,
): PersistenceAssessment {
  // §4.2/§4.3 — evaluate only the most recent 14 snapshots
  const window =
    relations.length > PERSISTENCE_WINDOW_SIZE
      ? relations.slice(0, PERSISTENCE_WINDOW_SIZE)
      : relations

  let alignedCount = 0
  let divergentCount = 0
  let orthogonalCount = 0
  let undeterminedCount = 0

  for (const relation of window) {
    switch (relation) {
      case 'aligned':
        alignedCount++
        break
      case 'divergent':
        divergentCount++
        break
      case 'orthogonal':
        orthogonalCount++
        break
      default:
        undeterminedCount++
        break
    }
  }

  return {
    alignedCount,
    divergentCount,
    orthogonalCount,
    undeterminedCount,
    totalSnapshots: window.length,
    persistentlyAligned:
      window.length >= PERSISTENCE_WINDOW_SIZE &&
      alignedCount >= PERSISTENCE_THRESHOLD,
    persistentlyDivergent:
      window.length >= PERSISTENCE_WINDOW_SIZE &&
      divergentCount >= PERSISTENCE_THRESHOLD,
  }
}
