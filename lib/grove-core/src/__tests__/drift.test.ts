import { describe, expect, it } from 'vitest'

import {
  findReferenceSnapshot,
  observeMotionDrift,
  observeShapeDrift,
} from '../drift'
import type { ReferenceSnapshot } from '../types'

// Forbidden vocabulary per CLAUDE.md
const FORBIDDEN_WORDS = [
  'success',
  'failure',
  'good',
  'bad',
  'healthy',
  'unhealthy',
  'underperforming',
  'productivity',
  'efficiency',
  'velocity',
  'optimize',
]

function assertObservationalLanguage(text: string) {
  for (const word of FORBIDDEN_WORDS) {
    expect(text.toLowerCase()).not.toContain(word)
  }
}

// ── findReferenceSnapshot ─────────────────────────────────────────

describe('findReferenceSnapshot', () => {
  it('returns undefined when snapshotsDesc is empty', () => {
    const result = findReferenceSnapshot('2025-06-01T00:00:00Z', [])
    expect(result).toBeUndefined()
  })

  it('returns undefined when phaseTimestamp is undefined', () => {
    const result = findReferenceSnapshot(undefined, [
      {
        fileCount: 100,
        ecosystemDependencyCount: 10,
        densityTier: 'rooting',
        observedAt: '2025-06-01T00:00:00Z',
      },
    ])
    expect(result).toBeUndefined()
  })

  it('finds snapshot closest to phaseTimestamp (at-or-after)', () => {
    const rows = [
      {
        fileCount: 300,
        ecosystemDependencyCount: 30,
        densityTier: 'dense_canopy',
        observedAt: '2025-06-15T00:00:00Z',
      },
      {
        fileCount: 200,
        ecosystemDependencyCount: 20,
        densityTier: 'thickening',
        observedAt: '2025-06-05T00:00:00Z',
      },
      {
        fileCount: 100,
        ecosystemDependencyCount: 10,
        densityTier: 'rooting',
        observedAt: '2025-05-15T00:00:00Z',
      },
    ]
    // Phase declared on June 3 — closest at-or-after is June 5
    const result = findReferenceSnapshot('2025-06-03T00:00:00Z', rows)
    expect(result).toBeDefined()
    expect(result!.observedAt).toBe('2025-06-05T00:00:00Z')
    expect(result!.fileCount).toBe(200)
    expect(result!.ecosystemDependencyCount).toBe(20)
    expect(result!.densityTier).toBe('thickening')
  })

  it('falls back to nearest before when none at-or-after', () => {
    const rows = [
      {
        fileCount: 100,
        ecosystemDependencyCount: 10,
        densityTier: 'rooting',
        observedAt: '2025-05-15T00:00:00Z',
      },
      {
        fileCount: 50,
        ecosystemDependencyCount: 5,
        densityTier: 'sparse',
        observedAt: '2025-04-15T00:00:00Z',
      },
    ]
    // Phase declared on June 1 — all rows are before; closest is May 15
    const result = findReferenceSnapshot('2025-06-01T00:00:00Z', rows)
    expect(result).toBeDefined()
    expect(result!.observedAt).toBe('2025-05-15T00:00:00Z')
    expect(result!.fileCount).toBe(100)
  })

  it('works with single row', () => {
    const rows = [
      {
        fileCount: 42,
        ecosystemDependencyCount: null,
        densityTier: null,
        observedAt: '2025-06-01T00:00:00Z',
      },
    ]
    const result = findReferenceSnapshot('2025-06-01T00:00:00Z', rows)
    expect(result).toBeDefined()
    expect(result!.fileCount).toBe(42)
    expect(result!.observedAt).toBe('2025-06-01T00:00:00Z')
    // Null fields are omitted
    expect(result!).not.toHaveProperty('ecosystemDependencyCount')
    expect(result!).not.toHaveProperty('densityTier')
  })

  it('suppresses when history is truncated and phase predates snapshot window', () => {
    const rows = [
      {
        fileCount: 200,
        ecosystemDependencyCount: 20,
        densityTier: 'thickening',
        observedAt: '2025-06-10T00:00:00Z',
      },
      {
        fileCount: 150,
        ecosystemDependencyCount: 15,
        densityTier: 'rooting',
        observedAt: '2025-06-01T00:00:00Z',
      },
    ]
    // Phase declared May 1 — predates all snapshots; history truncated
    const result = findReferenceSnapshot(
      '2025-05-01T00:00:00Z',
      rows,
      false, // historyComplete = false
    )
    expect(result).toBeUndefined()
  })

  it('returns reference when history is truncated but phase is within snapshot window', () => {
    const rows = [
      {
        fileCount: 200,
        ecosystemDependencyCount: 20,
        densityTier: 'thickening',
        observedAt: '2025-06-10T00:00:00Z',
      },
      {
        fileCount: 150,
        ecosystemDependencyCount: 15,
        densityTier: 'rooting',
        observedAt: '2025-06-01T00:00:00Z',
      },
    ]
    // Phase declared June 5 — within window even though history is truncated
    const result = findReferenceSnapshot(
      '2025-06-05T00:00:00Z',
      rows,
      false, // historyComplete = false
    )
    expect(result).toBeDefined()
    expect(result!.observedAt).toBe('2025-06-10T00:00:00Z')
  })

  it('returns reference when history is complete even if phase predates all snapshots', () => {
    const rows = [
      {
        fileCount: 100,
        ecosystemDependencyCount: 10,
        densityTier: 'rooting',
        observedAt: '2025-06-01T00:00:00Z',
      },
    ]
    // Phase predates window, but history IS complete — this is all the data
    const result = findReferenceSnapshot(
      '2025-05-01T00:00:00Z',
      rows,
      true, // historyComplete = true
    )
    expect(result).toBeDefined()
    expect(result!.observedAt).toBe('2025-06-01T00:00:00Z')
  })

  it('returns reference when phase timestamp equals oldest snapshot in truncated history', () => {
    const rows = [
      {
        fileCount: 200,
        ecosystemDependencyCount: 20,
        densityTier: 'thickening',
        observedAt: '2025-06-10T00:00:00Z',
      },
      {
        fileCount: 100,
        ecosystemDependencyCount: 10,
        densityTier: 'rooting',
        observedAt: '2025-06-01T00:00:00Z',
      },
    ]
    // Phase timestamp exactly matches oldest row — not strictly before
    const result = findReferenceSnapshot(
      '2025-06-01T00:00:00Z',
      rows,
      false,
    )
    expect(result).toBeDefined()
    expect(result!.observedAt).toBe('2025-06-01T00:00:00Z')
  })
})

// ── observeShapeDrift ─────────────────────────────────────────────

describe('observeShapeDrift', () => {
  const baseRef: ReferenceSnapshot = {
    fileCount: 100,
    ecosystemDependencyCount: 20,
    densityTier: 'rooting',
    observedAt: '2025-06-01T00:00:00Z',
  }

  it('returns undefined when no signals differ', () => {
    const result = observeShapeDrift(
      baseRef,
      {
        fileCount: 100,
        ecosystemDependencyCount: 20,
        observedAt: '2025-07-01T00:00:00Z',
      },
      'rooting',
    )
    expect(result).toBeUndefined()
  })

  it('returns description for fileCount shift', () => {
    const result = observeShapeDrift(
      baseRef,
      {
        fileCount: 250,
        ecosystemDependencyCount: 20,
        observedAt: '2025-07-01T00:00:00Z',
      },
      'rooting',
    )
    expect(result).toBeDefined()
    expect(result!.descriptions).toHaveLength(1)
    expect(result!.descriptions[0]).toContain('File count has shifted from 100 to 250')
  })

  it('returns description for ecosystemDependencyCount shift', () => {
    const result = observeShapeDrift(
      baseRef,
      {
        fileCount: 100,
        ecosystemDependencyCount: 35,
        observedAt: '2025-07-01T00:00:00Z',
      },
      'rooting',
    )
    expect(result).toBeDefined()
    expect(result!.descriptions).toHaveLength(1)
    expect(result!.descriptions[0]).toContain(
      'Ecosystem dependency count has shifted from 20 to 35',
    )
  })

  it('returns description for densityTier shift', () => {
    const result = observeShapeDrift(
      baseRef,
      {
        fileCount: 100,
        ecosystemDependencyCount: 20,
        observedAt: '2025-07-01T00:00:00Z',
      },
      'dense_canopy',
    )
    expect(result).toBeDefined()
    expect(result!.descriptions).toHaveLength(1)
    expect(result!.descriptions[0]).toContain(
      'Structural character has shifted from rooting to dense canopy',
    )
  })

  it('omits descriptions when reference or current value is missing', () => {
    const sparseRef: ReferenceSnapshot = {
      observedAt: '2025-06-01T00:00:00Z',
    }
    const result = observeShapeDrift(
      sparseRef,
      {
        fileCount: 100,
        ecosystemDependencyCount: 20,
        observedAt: '2025-07-01T00:00:00Z',
      },
      'rooting',
    )
    // No reference values → no comparisons → undefined
    expect(result).toBeUndefined()
  })

  it('returns multiple descriptions when multiple signals shift', () => {
    const result = observeShapeDrift(
      baseRef,
      {
        fileCount: 500,
        ecosystemDependencyCount: 50,
        observedAt: '2025-07-01T00:00:00Z',
      },
      'dense_canopy',
    )
    expect(result).toBeDefined()
    expect(result!.descriptions).toHaveLength(3)
  })
})

// ── observeMotionDrift ────────────────────────────────────────────

describe('observeMotionDrift', () => {
  it('returns undefined when commitsLast30d is undefined', () => {
    const result = observeMotionDrift('expanding', undefined, undefined)
    expect(result).toBeUndefined()
  })

  it('returns undefined for consolidating phase (never tenses)', () => {
    const result = observeMotionDrift('consolidating', 0, 0)
    expect(result).toBeUndefined()
  })

  it('returns undefined for pruning phase (never tenses)', () => {
    const result = observeMotionDrift('pruning', 0, 0)
    expect(result).toBeUndefined()
  })

  it('returns tension for expanding + quiet cadence', () => {
    const result = observeMotionDrift('expanding', 1, 5)
    expect(result).toBeDefined()
    expect(result!.description).toContain('expanding phase')
    expect(result!.description).toContain('fewer than 3 commits')
    expect(result!.description).toContain('appear in tension')
    expect(result!.phase).toBe('expanding')
    expect(result!.commitsLast30d).toBe(1)
    expect(result!.commitsLast90d).toBe(5)
  })

  it('returns tension for resting + active cadence', () => {
    const result = observeMotionDrift('resting', 20, 40)
    expect(result).toBeDefined()
    expect(result!.description).toContain('resting phase')
    expect(result!.description).toContain('20 commits')
    expect(result!.description).toContain('appear in tension')
  })

  it('returns tension for emerging + quiet cadence', () => {
    const result = observeMotionDrift('emerging', 2, 3)
    expect(result).toBeDefined()
    expect(result!.description).toContain('emerging phase')
  })

  it('returns tension for archival + active cadence', () => {
    const result = observeMotionDrift('archival', 16, 30)
    expect(result).toBeDefined()
    expect(result!.description).toContain('archival phase')
  })

  it('returns undefined for expanding + moderate cadence (not quiet enough)', () => {
    const result = observeMotionDrift('expanding', 10, 30)
    expect(result).toBeUndefined()
  })

  it('returns undefined for resting + quiet cadence (aligned)', () => {
    const result = observeMotionDrift('resting', 1, 3)
    expect(result).toBeUndefined()
  })

  it('returns undefined for resting + moderate cadence (no tension)', () => {
    const result = observeMotionDrift('resting', 10, 20)
    expect(result).toBeUndefined()
  })
})

// ── Observational language ────────────────────────────────────────

describe('observational language', () => {
  it('source file contains no forbidden vocabulary', async () => {
    const { readFileSync } = await import('node:fs')
    const { resolve } = await import('node:path')
    const source = readFileSync(resolve(__dirname, '../drift.ts'), 'utf-8')
    assertObservationalLanguage(source)
  })

  it('all generated shape drift descriptions pass language check', () => {
    const ref: ReferenceSnapshot = {
      fileCount: 100,
      ecosystemDependencyCount: 20,
      densityTier: 'rooting',
      observedAt: '2025-06-01T00:00:00Z',
    }
    const result = observeShapeDrift(
      ref,
      {
        fileCount: 500,
        ecosystemDependencyCount: 50,
        observedAt: '2025-07-01T00:00:00Z',
      },
      'dense_canopy',
    )
    for (const desc of result!.descriptions) {
      assertObservationalLanguage(desc)
    }
  })

  it('all generated motion drift descriptions pass language check', () => {
    const result1 = observeMotionDrift('expanding', 1, 5)
    assertObservationalLanguage(result1!.description)

    const result2 = observeMotionDrift('resting', 20, 40)
    assertObservationalLanguage(result2!.description)
  })
})
