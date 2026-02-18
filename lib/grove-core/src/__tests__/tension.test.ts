import { describe, expect, it } from 'vitest'

import { observeClimateTension } from '../tension'
import type { RepositoryEcology } from '../types'

describe('observeClimateTension', () => {
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
    const result = observeClimateTension(undefined, repos)
    expect(result).toHaveLength(0)
  })

  it('returns empty when all seasons match climate', () => {
    const repos = [
      makeRepo('a/b', 'consolidation'),
      makeRepo('c/d', 'consolidation'),
    ]
    const result = observeClimateTension('consolidation', repos)
    expect(result).toHaveLength(0)
  })

  it('returns tensions where season diverges from climate', () => {
    const repos = [
      makeRepo('a/b', 'expansion'),
      makeRepo('c/d', 'consolidation'),
      makeRepo('e/f', 'pruning'),
    ]
    const result = observeClimateTension('consolidation', repos)
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      fullName: 'a/b',
      climate: 'consolidation',
      season: 'expansion',
    })
    expect(result[1]).toEqual({
      fullName: 'e/f',
      climate: 'consolidation',
      season: 'pruning',
    })
  })

  it('ignores repos without derived season', () => {
    const repos = [
      makeRepo('a/b'), // no season (unclassified)
      makeRepo('c/d', 'expansion'),
    ]
    const result = observeClimateTension('dormancy', repos)
    expect(result).toHaveLength(1)
    expect(result[0].fullName).toBe('c/d')
  })
})
