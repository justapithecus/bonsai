import { describe, expect, it } from 'vitest'

import { deriveSeason } from '../season'

describe('deriveSeason', () => {
  it('maps emerging to expansion', () => {
    const result = deriveSeason('emerging')
    expect(result).toEqual({
      season: 'expansion',
      sourcePhase: 'emerging',
    })
  })

  it('maps expanding to expansion', () => {
    const result = deriveSeason('expanding')
    expect(result).toEqual({
      season: 'expansion',
      sourcePhase: 'expanding',
    })
  })

  it('maps consolidating to consolidation', () => {
    const result = deriveSeason('consolidating')
    expect(result).toEqual({
      season: 'consolidation',
      sourcePhase: 'consolidating',
    })
  })

  it('maps pruning to pruning', () => {
    const result = deriveSeason('pruning')
    expect(result).toEqual({
      season: 'pruning',
      sourcePhase: 'pruning',
    })
  })

  it('maps resting to dormancy with hibernation mode', () => {
    const result = deriveSeason('resting')
    expect(result).toEqual({
      season: 'dormancy',
      sourcePhase: 'resting',
      dormancyMode: 'hibernation',
    })
  })

  it('maps archival to dormancy with survival mode', () => {
    const result = deriveSeason('archival')
    expect(result).toEqual({
      season: 'dormancy',
      sourcePhase: 'archival',
      dormancyMode: 'survival',
    })
  })

  it('returns undefined for undefined phase', () => {
    const result = deriveSeason(undefined)
    expect(result).toBeUndefined()
  })
})
