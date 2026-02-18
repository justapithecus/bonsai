import { describe, expect, it } from 'vitest'

import { observeConsolidationInterval } from '../consolidation'

describe('observeConsolidationInterval', () => {
  const now = new Date('2025-06-15')

  it('returns elapsed when interval has passed', () => {
    const lastActivity = new Date('2024-12-01') // ~196 days ago
    const result = observeConsolidationInterval(180, lastActivity, now)
    expect(result).toBeDefined()
    expect(result!.elapsed).toBe(true)
    expect(result!.intervalDays).toBe(180)
    expect(result!.daysSinceActivity).toBeGreaterThanOrEqual(196)
  })

  it('returns not elapsed when within interval', () => {
    const lastActivity = new Date('2025-06-01') // 14 days ago
    const result = observeConsolidationInterval(180, lastActivity, now)
    expect(result).toBeDefined()
    expect(result!.elapsed).toBe(false)
    expect(result!.daysSinceActivity).toBe(14)
  })

  it('returns elapsed at exact boundary', () => {
    const lastActivity = new Date('2024-12-17') // exactly 180 days before 2025-06-15
    const result = observeConsolidationInterval(180, lastActivity, now)
    expect(result).toBeDefined()
    expect(result!.elapsed).toBe(true)
    expect(result!.daysSinceActivity).toBe(180)
  })

  it('returns not elapsed one day before boundary', () => {
    const lastActivity = new Date('2024-12-18') // 179 days before 2025-06-15
    const result = observeConsolidationInterval(180, lastActivity, now)
    expect(result).toBeDefined()
    expect(result!.elapsed).toBe(false)
    expect(result!.daysSinceActivity).toBe(179)
  })

  it('returns undefined when intervalDays is undefined', () => {
    const result = observeConsolidationInterval(
      undefined,
      new Date('2025-01-01'),
      now,
    )
    expect(result).toBeUndefined()
  })

  it('returns undefined when lastActivityDate is undefined', () => {
    const result = observeConsolidationInterval(180, undefined, now)
    expect(result).toBeUndefined()
  })

  it('returns undefined when both inputs are undefined', () => {
    const result = observeConsolidationInterval(undefined, undefined, now)
    expect(result).toBeUndefined()
  })

  it('handles zero days since activity', () => {
    const result = observeConsolidationInterval(30, now, now)
    expect(result).toBeDefined()
    expect(result!.daysSinceActivity).toBe(0)
    expect(result!.elapsed).toBe(false)
  })
})
