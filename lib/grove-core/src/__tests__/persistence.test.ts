import { describe, expect, it } from 'vitest'

import {
  assessPersistence,
  deriveSnapshotRelation,
  PERSISTENCE_THRESHOLD,
  PERSISTENCE_WINDOW_SIZE,
} from '../persistence'
import type { ClimateRelation } from '../types'

describe('deriveSnapshotRelation', () => {
  it('emerging + expansion climate → aligned', () => {
    expect(deriveSnapshotRelation('emerging', 'expansion')).toBe('aligned')
  })

  it('expanding + expansion climate → aligned', () => {
    expect(deriveSnapshotRelation('expanding', 'expansion')).toBe('aligned')
  })

  it('consolidating + consolidation climate → aligned', () => {
    expect(deriveSnapshotRelation('consolidating', 'consolidation')).toBe('aligned')
  })

  it('pruning + pruning climate → aligned', () => {
    expect(deriveSnapshotRelation('pruning', 'pruning')).toBe('aligned')
  })

  it('resting + dormancy climate → aligned', () => {
    expect(deriveSnapshotRelation('resting', 'dormancy')).toBe('aligned')
  })

  it('archival + dormancy climate → aligned', () => {
    expect(deriveSnapshotRelation('archival', 'dormancy')).toBe('aligned')
  })

  it('expanding + dormancy climate → divergent', () => {
    expect(deriveSnapshotRelation('expanding', 'dormancy')).toBe('divergent')
  })

  it('resting + expansion climate → divergent', () => {
    expect(deriveSnapshotRelation('resting', 'expansion')).toBe('divergent')
  })

  it('consolidating + expansion climate → orthogonal', () => {
    expect(deriveSnapshotRelation('consolidating', 'expansion')).toBe('orthogonal')
  })

  it('null phase → undefined', () => {
    expect(deriveSnapshotRelation(null, 'expansion')).toBeUndefined()
  })

  it('undefined phase → undefined', () => {
    expect(deriveSnapshotRelation(undefined, 'expansion')).toBeUndefined()
  })

  it('unknown string phase → undefined', () => {
    expect(deriveSnapshotRelation('nonsense', 'expansion')).toBeUndefined()
  })
})

describe('assessPersistence', () => {
  function fill(relation: ClimateRelation | undefined, count: number): Array<ClimateRelation | undefined> {
    return Array.from({ length: count }, () => relation)
  }

  it('14 aligned → persistentlyAligned: true', () => {
    const result = assessPersistence(fill('aligned', 14))
    expect(result.persistentlyAligned).toBe(true)
    expect(result.persistentlyDivergent).toBe(false)
    expect(result.alignedCount).toBe(14)
    expect(result.totalSnapshots).toBe(14)
  })

  it('9 aligned (exact threshold) → persistentlyAligned: true', () => {
    const relations = [...fill('aligned', 9), ...fill('orthogonal', 5)]
    const result = assessPersistence(relations)
    expect(result.persistentlyAligned).toBe(true)
    expect(result.alignedCount).toBe(9)
  })

  it('8 aligned → persistentlyAligned: false', () => {
    const relations = [...fill('aligned', 8), ...fill('orthogonal', 6)]
    const result = assessPersistence(relations)
    expect(result.persistentlyAligned).toBe(false)
    expect(result.alignedCount).toBe(8)
  })

  it('14 divergent → persistentlyDivergent: true', () => {
    const result = assessPersistence(fill('divergent', 14))
    expect(result.persistentlyDivergent).toBe(true)
    expect(result.persistentlyAligned).toBe(false)
    expect(result.divergentCount).toBe(14)
  })

  it('9 divergent (exact threshold) → persistentlyDivergent: true', () => {
    const relations = [...fill('divergent', 9), ...fill('aligned', 5)]
    const result = assessPersistence(relations)
    expect(result.persistentlyDivergent).toBe(true)
    expect(result.divergentCount).toBe(9)
  })

  it('8 divergent → persistentlyDivergent: false', () => {
    const relations = [...fill('divergent', 8), ...fill('aligned', 6)]
    const result = assessPersistence(relations)
    expect(result.persistentlyDivergent).toBe(false)
    expect(result.divergentCount).toBe(8)
  })

  it('mixed (7 aligned, 4 divergent, 3 orthogonal) → neither persistent', () => {
    const relations = [
      ...fill('aligned', 7),
      ...fill('divergent', 4),
      ...fill('orthogonal', 3),
    ]
    const result = assessPersistence(relations)
    expect(result.persistentlyAligned).toBe(false)
    expect(result.persistentlyDivergent).toBe(false)
    expect(result.alignedCount).toBe(7)
    expect(result.divergentCount).toBe(4)
    expect(result.orthogonalCount).toBe(3)
    expect(result.totalSnapshots).toBe(14)
  })

  it('empty array → all zeros, both false', () => {
    const result = assessPersistence([])
    expect(result.alignedCount).toBe(0)
    expect(result.divergentCount).toBe(0)
    expect(result.orthogonalCount).toBe(0)
    expect(result.undeterminedCount).toBe(0)
    expect(result.totalSnapshots).toBe(0)
    expect(result.persistentlyAligned).toBe(false)
    expect(result.persistentlyDivergent).toBe(false)
  })

  it('array with undefined entries → undeterminedCount correct', () => {
    const relations = [...fill('aligned', 5), ...fill(undefined, 9)]
    const result = assessPersistence(relations)
    expect(result.undeterminedCount).toBe(9)
    expect(result.alignedCount).toBe(5)
    expect(result.persistentlyAligned).toBe(false)
  })

  it('9 aligned + 5 undefined → persistentlyAligned: true', () => {
    const relations = [...fill('aligned', 9), ...fill(undefined, 5)]
    const result = assessPersistence(relations)
    expect(result.persistentlyAligned).toBe(true)
    expect(result.undeterminedCount).toBe(5)
  })

  it('sparse window (5 snapshots, all divergent) → persistentlyDivergent: false', () => {
    const result = assessPersistence(fill('divergent', 5))
    expect(result.persistentlyDivergent).toBe(false)
    expect(result.divergentCount).toBe(5)
    expect(result.totalSnapshots).toBe(5)
  })

  it('incomplete window (9 aligned, total=9) → persistentlyAligned: false', () => {
    const result = assessPersistence(fill('aligned', 9))
    expect(result.persistentlyAligned).toBe(false)
    expect(result.alignedCount).toBe(9)
    expect(result.totalSnapshots).toBe(9)
  })

  it('incomplete window (13 divergent, total=13) → persistentlyDivergent: false', () => {
    const result = assessPersistence(fill('divergent', 13))
    expect(result.persistentlyDivergent).toBe(false)
    expect(result.divergentCount).toBe(13)
    expect(result.totalSnapshots).toBe(13)
  })

  it('incomplete window (10 aligned + 2 orthogonal, total=12) → persistentlyAligned: false', () => {
    const relations = [...fill('aligned', 10), ...fill('orthogonal', 2)]
    const result = assessPersistence(relations)
    expect(result.persistentlyAligned).toBe(false)
    expect(result.totalSnapshots).toBe(12)
  })

  it('>14 relations → only first 14 evaluated', () => {
    // 9 aligned + 5 orthogonal + 6 divergent (20 total)
    // Only the first 14 are evaluated: 9 aligned + 5 orthogonal
    const relations = [...fill('aligned', 9), ...fill('orthogonal', 5), ...fill('divergent', 6)]
    const result = assessPersistence(relations)
    expect(result.persistentlyAligned).toBe(true)
    expect(result.alignedCount).toBe(9)
    expect(result.orthogonalCount).toBe(5)
    expect(result.divergentCount).toBe(0)
    expect(result.totalSnapshots).toBe(14)
  })

  it('>14 relations — entries beyond window do not count', () => {
    // 8 aligned + 6 orthogonal + 8 divergent (22 total)
    // Only first 14 evaluated: 8 aligned + 6 orthogonal → not persistent
    // The 8 divergent beyond the window are ignored
    const relations = [...fill('aligned', 8), ...fill('orthogonal', 6), ...fill('divergent', 8)]
    const result = assessPersistence(relations)
    expect(result.persistentlyAligned).toBe(false)
    expect(result.persistentlyDivergent).toBe(false)
    expect(result.divergentCount).toBe(0)
    expect(result.totalSnapshots).toBe(14)
  })
})

describe('constants', () => {
  it('PERSISTENCE_WINDOW_SIZE is 14', () => {
    expect(PERSISTENCE_WINDOW_SIZE).toBe(14)
  })

  it('PERSISTENCE_THRESHOLD is 9', () => {
    expect(PERSISTENCE_THRESHOLD).toBe(9)
  })
})
