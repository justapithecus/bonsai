import { describe, expect, it } from 'vitest'

import { surfaceRitualInvitations } from '../rituals'
import type {
  ConsolidationObservation,
  GroveDeclaration,
  PhaseDurationObservation,
} from '../types'

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

describe('surfaceRitualInvitations', () => {
  it('returns empty when no conditions are met', () => {
    const declaration: GroveDeclaration = {
      intent: 'Test',
      horizon: 'perennial',
      role: 'library',
      phase: 'consolidating',
      steward: 'Andrew',
      consolidation_interval_days: 180,
    }
    const consolidation: ConsolidationObservation = {
      intervalDays: 180,
      daysSinceActivity: 30,
      elapsed: false,
    }
    const result = surfaceRitualInvitations(declaration, consolidation)
    expect(result).toHaveLength(0)
  })

  it('surfaces consolidation when interval has elapsed', () => {
    const declaration: GroveDeclaration = {
      intent: 'Test',
      horizon: 'perennial',
      role: 'library',
      phase: 'consolidating',
      steward: 'Andrew',
    }
    const consolidation: ConsolidationObservation = {
      intervalDays: 90,
      daysSinceActivity: 100,
      elapsed: true,
    }
    const result = surfaceRitualInvitations(declaration, consolidation)
    expect(result).toHaveLength(1)
    expect(result[0].ritual).toBe('consolidation')
    assertObservationalLanguage(result[0].observation)
  })

  it('surfaces intent re-declaration when >= 2 fields undeclared', () => {
    const declaration: GroveDeclaration = {
      intent: 'Test',
      // horizon, role, phase, steward, consolidation_interval_days all undefined
    }
    const result = surfaceRitualInvitations(declaration, undefined)
    expect(result.some((r) => r.ritual === 'intent_redeclaration')).toBe(
      true,
    )
  })

  it('does not surface intent re-declaration when < 2 fields undeclared', () => {
    const declaration: GroveDeclaration = {
      intent: 'Test',
      horizon: 'perennial',
      role: 'library',
      phase: 'consolidating',
      steward: 'Andrew',
      // only consolidation_interval_days undefined = 1 undeclared
    }
    const result = surfaceRitualInvitations(declaration, undefined)
    expect(result.some((r) => r.ritual === 'intent_redeclaration')).toBe(
      false,
    )
  })

  it('returns empty when declaration is undefined', () => {
    const result = surfaceRitualInvitations(undefined, undefined)
    expect(result).toHaveLength(0)
  })

  it('uses observational language in all invitation text', () => {
    const declaration: GroveDeclaration = { intent: 'Test' }
    const consolidation: ConsolidationObservation = {
      intervalDays: 30,
      daysSinceActivity: 60,
      elapsed: true,
    }
    const result = surfaceRitualInvitations(declaration, consolidation)
    for (const invitation of result) {
      assertObservationalLanguage(invitation.observation)
    }
  })

  it('surfaces stewardship reaffirmation when phaseDuration suggests it', () => {
    const declaration: GroveDeclaration = {
      intent: 'Test',
      horizon: 'perennial',
      role: 'library',
      phase: 'consolidating',
      steward: 'Andrew',
      consolidation_interval_days: 180,
    }
    const phaseDuration: PhaseDurationObservation = {
      phase: 'consolidating',
      declaredAt: '2024-01-01T00:00:00Z',
      daysSinceDeclared: 400,
      horizon: 'perennial',
    }
    const result = surfaceRitualInvitations(declaration, undefined, phaseDuration)
    const reaffirmation = result.find(
      (r) => r.ritual === 'stewardship_reaffirmation',
    )
    expect(reaffirmation).toBeDefined()
    assertObservationalLanguage(reaffirmation!.observation)
    expect(reaffirmation!.observation).toContain('consolidating')
    expect(reaffirmation!.observation).toContain('400 days')
  })

  it('does not surface stewardship reaffirmation when phaseDuration is undefined', () => {
    const declaration: GroveDeclaration = {
      intent: 'Test',
      horizon: 'perennial',
      role: 'library',
      phase: 'consolidating',
      steward: 'Andrew',
    }
    const result = surfaceRitualInvitations(declaration, undefined, undefined)
    expect(result.some((r) => r.ritual === 'stewardship_reaffirmation')).toBe(
      false,
    )
  })

  it('backward compatible — works without third argument', () => {
    const declaration: GroveDeclaration = {
      intent: 'Test',
      horizon: 'perennial',
      role: 'library',
      phase: 'consolidating',
      steward: 'Andrew',
    }
    // Calling with 2 args (original signature) still works
    const result = surfaceRitualInvitations(declaration, undefined)
    expect(result.some((r) => r.ritual === 'stewardship_reaffirmation')).toBe(
      false,
    )
  })
})
