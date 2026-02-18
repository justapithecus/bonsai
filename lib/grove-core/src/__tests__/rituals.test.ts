import { describe, expect, it } from 'vitest'

import {
  surfaceEcosystemInvitations,
  surfaceRitualInvitations,
} from '../rituals'
import type {
  ConsolidationObservation,
  GroveDeclaration,
  RepositoryEcology,
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
})

describe('surfaceEcosystemInvitations', () => {
  const makeRepo = (
    fullName: string,
    season?: string,
  ): RepositoryEcology => ({
    fullName,
    htmlUrl: `https://github.com/${fullName}`,
    classified: season !== undefined,
    season: season
      ? {
          season: season as 'expansion' | 'consolidation' | 'pruning' | 'dormancy',
          sourcePhase: 'expanding',
        }
      : undefined,
  })

  it('returns empty when no climate declared', () => {
    const repos = [makeRepo('a/b', 'expansion')]
    const result = surfaceEcosystemInvitations(undefined, repos)
    expect(result).toHaveLength(0)
  })

  it('returns empty when all repos match climate', () => {
    const repos = [
      makeRepo('a/b', 'consolidation'),
      makeRepo('c/d', 'consolidation'),
    ]
    const result = surfaceEcosystemInvitations('consolidation', repos)
    expect(result).toHaveLength(0)
  })

  it('returns empty when tension is below 50%', () => {
    const repos = [
      makeRepo('a/b', 'consolidation'),
      makeRepo('c/d', 'consolidation'),
      makeRepo('e/f', 'expansion'), // 1 of 3 = 33%
    ]
    const result = surfaceEcosystemInvitations('consolidation', repos)
    expect(result).toHaveLength(0)
  })

  it('surfaces ecosystem balance when tension >= 50%', () => {
    const repos = [
      makeRepo('a/b', 'expansion'),
      makeRepo('c/d', 'expansion'),
      makeRepo('e/f', 'consolidation'),
      makeRepo('g/h', 'pruning'),
    ]
    // 3 of 4 diverge from 'dormancy'
    const result = surfaceEcosystemInvitations('dormancy', repos)
    expect(result).toHaveLength(1)
    expect(result[0].ritual).toBe('ecosystem_balance')
    assertObservationalLanguage(result[0].observation)
  })

  it('ignores repos without derived season', () => {
    const repos = [
      makeRepo('a/b', undefined), // unclassified
      makeRepo('c/d', 'expansion'),
    ]
    // 1 of 1 classified diverges = 100%
    const result = surfaceEcosystemInvitations('dormancy', repos)
    expect(result).toHaveLength(1)
  })

  it('returns empty when no classified repos exist', () => {
    const repos = [makeRepo('a/b'), makeRepo('c/d')]
    const result = surfaceEcosystemInvitations('expansion', repos)
    expect(result).toHaveLength(0)
  })
})
