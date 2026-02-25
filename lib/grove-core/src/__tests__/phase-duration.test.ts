import { describe, expect, it } from 'vitest'

import { observePhaseDuration, suggestsReaffirmation } from '../phase-duration'
import type { PhaseDurationObservation } from '../types'

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

describe('observePhaseDuration', () => {
  const now = new Date('2025-06-15T00:00:00Z')

  it('returns undefined when phase is missing', () => {
    const result = observePhaseDuration(
      undefined,
      '2025-01-01T00:00:00Z',
      'perennial',
      now,
    )
    expect(result).toBeUndefined()
  })

  it('returns undefined when declaredAt is missing', () => {
    const result = observePhaseDuration(
      'consolidating',
      undefined,
      'perennial',
      now,
    )
    expect(result).toBeUndefined()
  })

  it('returns undefined for invalid date string', () => {
    const result = observePhaseDuration(
      'consolidating',
      'not-a-date',
      'perennial',
      now,
    )
    expect(result).toBeUndefined()
  })

  it('correctly computes daysSinceDeclared', () => {
    // 2025-01-01 to 2025-06-15 = 165 days
    const result = observePhaseDuration(
      'expanding',
      '2025-01-01T00:00:00Z',
      'seasonal',
      now,
    )
    expect(result).toBeDefined()
    expect(result!.daysSinceDeclared).toBe(165)
    expect(result!.phase).toBe('expanding')
    expect(result!.declaredAt).toBe('2025-01-01T00:00:00Z')
  })

  it('includes horizon when provided', () => {
    const result = observePhaseDuration(
      'consolidating',
      '2025-01-01T00:00:00Z',
      'perennial',
      now,
    )
    expect(result!.horizon).toBe('perennial')
  })

  it('omits horizon when undefined', () => {
    const result = observePhaseDuration(
      'consolidating',
      '2025-01-01T00:00:00Z',
      undefined,
      now,
    )
    expect(result).toBeDefined()
    expect(result!).not.toHaveProperty('horizon')
  })

  it('clamps to 0 when declaredAt is in the future', () => {
    const result = observePhaseDuration(
      'consolidating',
      '2025-12-01T00:00:00Z', // future relative to now
      'perennial',
      now,
    )
    expect(result).toBeDefined()
    expect(result!.daysSinceDeclared).toBe(0)
  })

  it('returns 0 days when declared today', () => {
    const result = observePhaseDuration(
      'emerging',
      '2025-06-15T00:00:00Z',
      'ephemeral',
      now,
    )
    expect(result!.daysSinceDeclared).toBe(0)
  })
})

describe('suggestsReaffirmation', () => {
  it('never triggers for ephemeral horizon', () => {
    const obs: PhaseDurationObservation = {
      phase: 'consolidating',
      declaredAt: '2020-01-01T00:00:00Z',
      daysSinceDeclared: 9999,
      horizon: 'ephemeral',
    }
    expect(suggestsReaffirmation(obs)).toBe(false)
  })

  it('triggers at 180 days for seasonal horizon', () => {
    const at179: PhaseDurationObservation = {
      phase: 'expanding',
      declaredAt: '2025-01-01T00:00:00Z',
      daysSinceDeclared: 179,
      horizon: 'seasonal',
    }
    expect(suggestsReaffirmation(at179)).toBe(false)

    const at180: PhaseDurationObservation = {
      phase: 'expanding',
      declaredAt: '2025-01-01T00:00:00Z',
      daysSinceDeclared: 180,
      horizon: 'seasonal',
    }
    expect(suggestsReaffirmation(at180)).toBe(true)
  })

  it('triggers at 365 days for perennial horizon', () => {
    const at364: PhaseDurationObservation = {
      phase: 'consolidating',
      declaredAt: '2024-01-01T00:00:00Z',
      daysSinceDeclared: 364,
      horizon: 'perennial',
    }
    expect(suggestsReaffirmation(at364)).toBe(false)

    const at365: PhaseDurationObservation = {
      phase: 'consolidating',
      declaredAt: '2024-01-01T00:00:00Z',
      daysSinceDeclared: 365,
      horizon: 'perennial',
    }
    expect(suggestsReaffirmation(at365)).toBe(true)
  })

  it('triggers at 730 days for civilizational horizon', () => {
    const at729: PhaseDurationObservation = {
      phase: 'consolidating',
      declaredAt: '2023-01-01T00:00:00Z',
      daysSinceDeclared: 729,
      horizon: 'civilizational',
    }
    expect(suggestsReaffirmation(at729)).toBe(false)

    const at730: PhaseDurationObservation = {
      phase: 'consolidating',
      declaredAt: '2023-01-01T00:00:00Z',
      daysSinceDeclared: 730,
      horizon: 'civilizational',
    }
    expect(suggestsReaffirmation(at730)).toBe(true)
  })

  it('defaults to 365 days when horizon is undefined', () => {
    const at364: PhaseDurationObservation = {
      phase: 'consolidating',
      declaredAt: '2024-01-01T00:00:00Z',
      daysSinceDeclared: 364,
    }
    expect(suggestsReaffirmation(at364)).toBe(false)

    const at365: PhaseDurationObservation = {
      phase: 'consolidating',
      declaredAt: '2024-01-01T00:00:00Z',
      daysSinceDeclared: 365,
    }
    expect(suggestsReaffirmation(at365)).toBe(true)
  })

  it('never triggers for ephemeral horizon even in resting phase with consolidation interval', () => {
    const obs: PhaseDurationObservation = {
      phase: 'resting',
      declaredAt: '2020-01-01T00:00:00Z',
      daysSinceDeclared: 9999,
      horizon: 'ephemeral',
    }
    expect(suggestsReaffirmation(obs, 30)).toBe(false)
  })

  it('uses consolidation interval for resting phase', () => {
    const obs: PhaseDurationObservation = {
      phase: 'resting',
      declaredAt: '2025-01-01T00:00:00Z',
      daysSinceDeclared: 90,
      horizon: 'perennial',
    }
    // 90 days >= 90 consolidation interval → true
    expect(suggestsReaffirmation(obs, 90)).toBe(true)
    // 90 days < 91 consolidation interval → false
    expect(suggestsReaffirmation(obs, 91)).toBe(false)
  })

  it('falls back to horizon threshold for resting phase without consolidation interval', () => {
    const obs: PhaseDurationObservation = {
      phase: 'resting',
      declaredAt: '2024-01-01T00:00:00Z',
      daysSinceDeclared: 365,
      horizon: 'perennial',
    }
    // No consolidation interval → use perennial threshold (365)
    expect(suggestsReaffirmation(obs)).toBe(true)
  })
})

describe('observational language', () => {
  it('source file contains no forbidden vocabulary', async () => {
    // Read the source file and check all string literals
    const { readFileSync } = await import('node:fs')
    const { resolve } = await import('node:path')
    const source = readFileSync(
      resolve(__dirname, '../phase-duration.ts'),
      'utf-8',
    )
    assertObservationalLanguage(source)
  })
})
