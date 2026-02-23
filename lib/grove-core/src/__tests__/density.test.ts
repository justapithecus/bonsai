import { describe, expect, it } from 'vitest'

import { observeStructuralDensity } from '../density'
import type {
  ConsolidationObservation,
  DensityTier,
  StructuralSignals,
} from '../types'
import { DENSITY_TIERS } from '../types'

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

function makeSignals(
  overrides: Partial<StructuralSignals> = {},
): StructuralSignals {
  return {
    observedAt: '2025-06-15T00:00:00Z',
    ...overrides,
  }
}

function makeConsolidation(
  overrides: Partial<ConsolidationObservation> = {},
): ConsolidationObservation {
  return {
    intervalDays: 180,
    daysSinceActivity: 200,
    elapsed: true,
    ...overrides,
  }
}

describe('observeStructuralDensity', () => {
  describe('insufficient signals', () => {
    it('returns undefined when all core signals are absent', () => {
      const result = observeStructuralDensity(makeSignals())
      expect(result).toBeUndefined()
    })

    it('returns undefined when only observedAt is provided', () => {
      const result = observeStructuralDensity(
        makeSignals({ dependencyManifestsObserved: ['package.json'] }),
      )
      expect(result).toBeUndefined()
    })

    it('returns undefined when only ecosystemDependencyCount is provided', () => {
      const result = observeStructuralDensity(
        makeSignals({ ecosystemDependencyCount: 3 }),
      )
      expect(result).toBeUndefined()
    })
  })

  describe('tier classification', () => {
    it('classifies sparse — minimal structure', () => {
      const result = observeStructuralDensity(
        makeSignals({ fileCount: 5, commitsLast30d: 0, commitsLast90d: 0 }),
      )
      expect(result).toBeDefined()
      expect(result!.tier).toBe('sparse')
    })

    it('classifies rooting — small establishing project', () => {
      const result = observeStructuralDensity(
        makeSignals({
          fileCount: 80,
          commitsLast30d: 8,
          commitsLast90d: 20,
        }),
      )
      expect(result).toBeDefined()
      expect(result!.tier).toBe('rooting')
    })

    it('classifies thickening — moderate activity', () => {
      const result = observeStructuralDensity(
        makeSignals({
          fileCount: 250,
          commitsLast30d: 20,
          commitsLast90d: 50,
        }),
      )
      expect(result).toBeDefined()
      expect(result!.tier).toBe('thickening')
    })

    it('classifies dense_canopy — substantial structure', () => {
      const result = observeStructuralDensity(
        makeSignals({
          fileCount: 600,
          commitsLast30d: 40,
          commitsLast90d: 100,
          ecosystemDependencyCount: 3,
        }),
      )
      expect(result).toBeDefined()
      expect(result!.tier).toBe('dense_canopy')
    })

    it('classifies tangled_thicket — complex convergence', () => {
      const result = observeStructuralDensity(
        makeSignals({
          fileCount: 1000,
          commitsLast30d: 50,
          commitsLast90d: 120,
          ecosystemDependencyCount: 8,
        }),
        makeConsolidation({
          intervalDays: 90,
          daysSinceActivity: 300,
          elapsed: true,
        }),
      )
      expect(result).toBeDefined()
      expect(result!.tier).toBe('tangled_thicket')
    })
  })

  describe('consolidation influence', () => {
    const baseSignals = makeSignals({
      fileCount: 200,
      commitsLast30d: 10,
      commitsLast90d: 25,
    })

    it('produces equal or higher tier with elapsed consolidation', () => {
      const withoutConsolidation = observeStructuralDensity(baseSignals)
      const withConsolidation = observeStructuralDensity(
        baseSignals,
        makeConsolidation({
          intervalDays: 90,
          daysSinceActivity: 300,
          elapsed: true,
        }),
      )

      expect(withoutConsolidation).toBeDefined()
      expect(withConsolidation).toBeDefined()

      const tierIndex = (tier: DensityTier) => DENSITY_TIERS.indexOf(tier)
      expect(tierIndex(withConsolidation!.tier)).toBeGreaterThanOrEqual(
        tierIndex(withoutConsolidation!.tier),
      )
    })

    it('does not influence result when consolidation is not elapsed', () => {
      const withoutConsolidation = observeStructuralDensity(baseSignals)
      const withNonElapsed = observeStructuralDensity(
        baseSignals,
        makeConsolidation({
          intervalDays: 180,
          daysSinceActivity: 30,
          elapsed: false,
        }),
      )

      expect(withoutConsolidation).toBeDefined()
      expect(withNonElapsed).toBeDefined()
      expect(withNonElapsed!.tier).toBe(withoutConsolidation!.tier)
    })
  })

  describe('partial signals', () => {
    it('produces valid result with fileCount only', () => {
      const result = observeStructuralDensity(
        makeSignals({ fileCount: 100 }),
      )
      expect(result).toBeDefined()
      expect(DENSITY_TIERS).toContain(result!.tier)
    })

    it('produces valid result with commitsLast30d only', () => {
      const result = observeStructuralDensity(
        makeSignals({ commitsLast30d: 20 }),
      )
      expect(result).toBeDefined()
      expect(DENSITY_TIERS).toContain(result!.tier)
    })

    it('produces valid result with commitsLast90d only', () => {
      const result = observeStructuralDensity(
        makeSignals({ commitsLast90d: 40 }),
      )
      expect(result).toBeDefined()
      expect(DENSITY_TIERS).toContain(result!.tier)
    })
  })

  describe('entanglement influence', () => {
    it('produces equal or higher tier with ecosystem dependencies', () => {
      const baseSignals = makeSignals({
        fileCount: 150,
        commitsLast30d: 10,
        commitsLast90d: 25,
      })
      const entangledSignals = makeSignals({
        fileCount: 150,
        commitsLast30d: 10,
        commitsLast90d: 25,
        ecosystemDependencyCount: 6,
      })

      const without = observeStructuralDensity(baseSignals)
      const withEntanglement = observeStructuralDensity(entangledSignals)

      expect(without).toBeDefined()
      expect(withEntanglement).toBeDefined()

      const tierIndex = (tier: DensityTier) => DENSITY_TIERS.indexOf(tier)
      expect(tierIndex(withEntanglement!.tier)).toBeGreaterThanOrEqual(
        tierIndex(without!.tier),
      )
    })
  })

  describe('output shape', () => {
    it('preserves signals in output', () => {
      const signals = makeSignals({
        fileCount: 50,
        commitsLast30d: 5,
        commitsLast90d: 15,
        dependencyManifestsObserved: ['package.json', 'go.mod'],
        ecosystemDependencyCount: 2,
      })

      const result = observeStructuralDensity(signals)
      expect(result).toBeDefined()
      expect(result!.signals).toBe(signals)
    })

    it('includes a description string', () => {
      const result = observeStructuralDensity(
        makeSignals({ fileCount: 50, commitsLast30d: 3 }),
      )
      expect(result).toBeDefined()
      expect(result!.description).toBeTruthy()
      expect(typeof result!.description).toBe('string')
    })
  })

  describe('language compliance', () => {
    it('tier descriptions contain no forbidden vocabulary', () => {
      // Iterate all tiers by testing across a range of inputs
      const testCases: StructuralSignals[] = [
        makeSignals({ fileCount: 2, commitsLast30d: 0, commitsLast90d: 0 }),
        makeSignals({ fileCount: 30, commitsLast30d: 5, commitsLast90d: 10 }),
        makeSignals({
          fileCount: 120,
          commitsLast30d: 12,
          commitsLast90d: 30,
        }),
        makeSignals({
          fileCount: 500,
          commitsLast30d: 25,
          commitsLast90d: 60,
        }),
        makeSignals({
          fileCount: 1000,
          commitsLast30d: 50,
          commitsLast90d: 120,
          ecosystemDependencyCount: 8,
        }),
      ]

      const descriptions = new Set<string>()
      for (const signals of testCases) {
        const result = observeStructuralDensity(
          signals,
          makeConsolidation({
            intervalDays: 90,
            daysSinceActivity: 300,
            elapsed: true,
          }),
        )
        if (result) {
          descriptions.add(result.description)
        }
      }

      for (const description of descriptions) {
        for (const word of FORBIDDEN_WORDS) {
          expect(description.toLowerCase()).not.toContain(word.toLowerCase())
        }
      }
    })
  })
})
