import { describe, expect, it } from 'vitest'

import {
  classifyRepository,
  classifyStratum,
  deriveClimateRelation,
  deriveRoleClass,
} from '../ecosystem-balance'
import type { Climate, RepositoryEcology, Season } from '../types'
import { CLIMATES, SEASONS } from '../types'

describe('deriveRoleClass', () => {
  it('maps infrastructure to foundational', () => {
    expect(deriveRoleClass('infrastructure')).toBe('foundational')
  })

  it('maps civilizational to foundational', () => {
    expect(deriveRoleClass('civilizational')).toBe('foundational')
  })

  it('maps stewardship to system', () => {
    expect(deriveRoleClass('stewardship')).toBe('system')
  })

  it('maps library to system', () => {
    expect(deriveRoleClass('library')).toBe('system')
  })

  it('maps application to domain', () => {
    expect(deriveRoleClass('application')).toBe('domain')
  })

  it('maps experiment to domain', () => {
    expect(deriveRoleClass('experiment')).toBe('domain')
  })

  it('maps documentation to domain', () => {
    expect(deriveRoleClass('documentation')).toBe('domain')
  })
})

describe('deriveClimateRelation', () => {
  // §1.3 — full 16-cell matrix
  const expected: Record<Climate, Record<Season, string>> = {
    expansion: {
      expansion: 'aligned',
      consolidation: 'orthogonal',
      pruning: 'divergent',
      dormancy: 'divergent',
    },
    consolidation: {
      expansion: 'orthogonal',
      consolidation: 'aligned',
      pruning: 'orthogonal',
      dormancy: 'divergent',
    },
    pruning: {
      expansion: 'divergent',
      consolidation: 'orthogonal',
      pruning: 'aligned',
      dormancy: 'orthogonal',
    },
    dormancy: {
      expansion: 'divergent',
      consolidation: 'divergent',
      pruning: 'orthogonal',
      dormancy: 'aligned',
    },
  }

  for (const climate of CLIMATES) {
    for (const season of SEASONS) {
      it(`climate=${climate}, season=${season} → ${expected[climate][season]}`, () => {
        expect(deriveClimateRelation(season, climate)).toBe(
          expected[climate][season],
        )
      })
    }
  }

  it('diagonal is always aligned', () => {
    for (const value of SEASONS) {
      expect(deriveClimateRelation(value, value)).toBe('aligned')
    }
  })
})

describe('classifyStratum', () => {
  it('perennial + foundational → structural_core', () => {
    expect(classifyStratum('perennial', 'foundational')).toBe('structural_core')
  })

  it('generational + system → structural_core', () => {
    expect(classifyStratum('generational', 'system')).toBe('structural_core')
  })

  it('perennial + system → structural_core', () => {
    expect(classifyStratum('perennial', 'system')).toBe('structural_core')
  })

  it('generational + foundational → structural_core', () => {
    expect(classifyStratum('generational', 'foundational')).toBe(
      'structural_core',
    )
  })

  it('perennial + domain → long_arc_domain', () => {
    expect(classifyStratum('perennial', 'domain')).toBe('long_arc_domain')
  })

  it('generational + domain → long_arc_domain', () => {
    expect(classifyStratum('generational', 'domain')).toBe('long_arc_domain')
  })

  it('ephemeral + foundational → ephemeral_field', () => {
    expect(classifyStratum('ephemeral', 'foundational')).toBe('ephemeral_field')
  })

  it('ephemeral + system → ephemeral_field', () => {
    expect(classifyStratum('ephemeral', 'system')).toBe('ephemeral_field')
  })

  it('ephemeral + domain → ephemeral_field', () => {
    expect(classifyStratum('ephemeral', 'domain')).toBe('ephemeral_field')
  })

  it('seasonal + foundational → undefined', () => {
    expect(classifyStratum('seasonal', 'foundational')).toBeUndefined()
  })

  it('seasonal + system → undefined', () => {
    expect(classifyStratum('seasonal', 'system')).toBeUndefined()
  })

  it('seasonal + domain → undefined', () => {
    expect(classifyStratum('seasonal', 'domain')).toBeUndefined()
  })
})

describe('classifyRepository', () => {
  const makeRepo = (
    horizon?: string,
    role?: string,
  ): RepositoryEcology => ({
    fullName: 'test/repo',
    htmlUrl: 'https://github.com/test/repo',
    classified: true,
    declaration: {
      intent: 'test',
      ...(horizon ? { horizon: horizon as RepositoryEcology['declaration'] extends { horizon?: infer H } ? H : never } : {}),
      ...(role ? { role: role as RepositoryEcology['declaration'] extends { role?: infer R } ? R : never } : {}),
    },
  })

  it('classifies repo with both horizon and role', () => {
    const result = classifyRepository(makeRepo('perennial', 'infrastructure'))
    expect(result).toEqual({
      roleClass: 'foundational',
      stratum: 'structural_core',
    })
  })

  it('classifies perennial domain repo', () => {
    const result = classifyRepository(makeRepo('perennial', 'application'))
    expect(result).toEqual({
      roleClass: 'domain',
      stratum: 'long_arc_domain',
    })
  })

  it('classifies ephemeral repo', () => {
    const result = classifyRepository(makeRepo('ephemeral', 'experiment'))
    expect(result).toEqual({
      roleClass: 'domain',
      stratum: 'ephemeral_field',
    })
  })

  it('returns roleClass without stratum for seasonal horizon', () => {
    const result = classifyRepository(makeRepo('seasonal', 'library'))
    expect(result).toEqual({ roleClass: 'system' })
    expect(result?.stratum).toBeUndefined()
  })

  it('returns undefined when horizon is missing', () => {
    const result = classifyRepository(makeRepo(undefined, 'infrastructure'))
    expect(result).toBeUndefined()
  })

  it('returns undefined when role is missing', () => {
    const result = classifyRepository(makeRepo('perennial', undefined))
    expect(result).toBeUndefined()
  })

  it('returns undefined when both are missing', () => {
    const repo: RepositoryEcology = {
      fullName: 'test/repo',
      htmlUrl: 'https://github.com/test/repo',
      classified: false,
    }
    expect(classifyRepository(repo)).toBeUndefined()
  })

  it('returns undefined when declaration is absent', () => {
    const repo: RepositoryEcology = {
      fullName: 'test/repo',
      htmlUrl: 'https://github.com/test/repo',
      classified: false,
      declaration: undefined,
    }
    expect(classifyRepository(repo)).toBeUndefined()
  })
})
