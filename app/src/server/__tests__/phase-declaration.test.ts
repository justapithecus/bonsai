import { describe, expect, it } from 'vitest'

import { findPhaseDeclarationTimestamp } from '../repository'

describe('findPhaseDeclarationTimestamp', () => {
  it('returns undefined when currentPhase is undefined', () => {
    const rows = [{ phase: 'consolidating', observedAt: '2025-01-01T00:00:00Z' }]
    expect(findPhaseDeclarationTimestamp(undefined, rows, true)).toBeUndefined()
  })

  it('returns undefined when declarations are empty', () => {
    expect(findPhaseDeclarationTimestamp('consolidating', [], true)).toBeUndefined()
  })

  it('returns oldest timestamp in consecutive run', () => {
    const rows = [
      { phase: 'consolidating', observedAt: '2025-06-01T00:00:00Z' },
      { phase: 'consolidating', observedAt: '2025-03-01T00:00:00Z' },
      { phase: 'expanding', observedAt: '2025-01-01T00:00:00Z' },
    ]
    expect(findPhaseDeclarationTimestamp('consolidating', rows, true))
      .toBe('2025-03-01T00:00:00Z')
  })

  it('returns first row timestamp when only one row matches', () => {
    const rows = [
      { phase: 'consolidating', observedAt: '2025-06-01T00:00:00Z' },
      { phase: 'expanding', observedAt: '2025-01-01T00:00:00Z' },
    ]
    expect(findPhaseDeclarationTimestamp('consolidating', rows, true))
      .toBe('2025-06-01T00:00:00Z')
  })

  it('returns oldest when all rows match and history is complete', () => {
    const rows = [
      { phase: 'resting', observedAt: '2025-06-01T00:00:00Z' },
      { phase: 'resting', observedAt: '2025-03-01T00:00:00Z' },
      { phase: 'resting', observedAt: '2025-01-01T00:00:00Z' },
    ]
    expect(findPhaseDeclarationTimestamp('resting', rows, true))
      .toBe('2025-01-01T00:00:00Z')
  })

  it('returns undefined when all rows match but history is truncated', () => {
    // All fetched rows share the current phase, but history was truncated —
    // the true phase start may predate the window.
    const rows = [
      { phase: 'resting', observedAt: '2025-06-01T00:00:00Z' },
      { phase: 'resting', observedAt: '2025-03-01T00:00:00Z' },
      { phase: 'resting', observedAt: '2025-01-01T00:00:00Z' },
    ]
    expect(findPhaseDeclarationTimestamp('resting', rows, false)).toBeUndefined()
  })

  it('returns timestamp when consecutive run ends before window edge on truncated history', () => {
    // History is truncated, but the consecutive run ends mid-window —
    // we found the real phase transition, so the timestamp is reliable.
    const rows = [
      { phase: 'consolidating', observedAt: '2025-06-01T00:00:00Z' },
      { phase: 'consolidating', observedAt: '2025-03-01T00:00:00Z' },
      { phase: 'expanding', observedAt: '2025-01-01T00:00:00Z' },
    ]
    expect(findPhaseDeclarationTimestamp('consolidating', rows, false))
      .toBe('2025-03-01T00:00:00Z')
  })

  it('returns undefined when currentPhase does not match first row', () => {
    const rows = [
      { phase: 'expanding', observedAt: '2025-06-01T00:00:00Z' },
      { phase: 'consolidating', observedAt: '2025-01-01T00:00:00Z' },
    ]
    // Current phase is consolidating but most recent row is expanding
    expect(findPhaseDeclarationTimestamp('consolidating', rows, true)).toBeUndefined()
  })
})
