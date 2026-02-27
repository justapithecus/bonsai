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
 * Counts aligned, divergent, orthogonal, and undetermined entries.
 * A relation is persistent when its count meets PERSISTENCE_THRESHOLD (9).
 * Sparse windows (fewer than threshold snapshots) can never reach persistence.
 */
export function assessPersistence(
  relations: ReadonlyArray<ClimateRelation | undefined>,
): PersistenceAssessment {
  let alignedCount = 0
  let divergentCount = 0
  let orthogonalCount = 0
  let undeterminedCount = 0

  for (const relation of relations) {
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
    totalSnapshots: relations.length,
    persistentlyAligned: alignedCount >= PERSISTENCE_THRESHOLD,
    persistentlyDivergent: divergentCount >= PERSISTENCE_THRESHOLD,
  }
}
