import type { Horizon, Phase, RepositoryEcology, Role } from '@grove/core'
import { deriveSeason } from '@grove/core'
import Database from 'better-sqlite3'
import { beforeEach, describe, expect, it } from 'vitest'

import { createDb, type GroveDb } from '../db/client'
import { ecologySnapshots, repositories } from '../db/schema'
import { evaluatePortfolioEcosystemTriggers } from '../ecosystem-triggers'

let db: GroveDb

beforeEach(() => {
  const sqlite = new Database(':memory:')
  db = createDb(sqlite)
})

// --- Helpers ---

function makeEcology(
  fullName: string,
  opts: { horizon?: Horizon; role?: Role; phase?: Phase } = {},
): RepositoryEcology {
  const classified = !!(opts.horizon && opts.role)
  const season = opts.phase ? deriveSeason(opts.phase) : undefined
  return {
    fullName,
    htmlUrl: `https://github.com/${fullName}`,
    classified,
    declaration: {
      intent: 'test',
      ...(opts.horizon ? { horizon: opts.horizon } : {}),
      ...(opts.role ? { role: opts.role } : {}),
      ...(opts.phase ? { phase: opts.phase } : {}),
    },
    ...(season ? { season } : {}),
  }
}

function seedRepo(fullName: string) {
  db.insert(repositories)
    .values({
      fullName,
      htmlUrl: `https://github.com/${fullName}`,
      defaultBranch: 'main',
      lastObservedAt: new Date().toISOString(),
    })
    .onConflictDoNothing()
    .run()
}

function seedSnapshots(
  fullName: string,
  phase: string,
  count: number,
  startDay = 1,
) {
  seedRepo(fullName)
  for (let i = 0; i < count; i++) {
    db.insert(ecologySnapshots)
      .values({
        fullName,
        observedAt: `2025-01-${String(startDay + i).padStart(2, '0')}T12:00:00Z`,
        classified: true,
        phase,
      })
      .run()
  }
}

// --- evaluatePortfolioEcosystemTriggers ---

describe('evaluatePortfolioEcosystemTriggers', () => {
  it('returns undefined when climate is undefined', () => {
    const repos = [
      makeEcology('org/core', {
        horizon: 'perennial',
        role: 'infrastructure',
        phase: 'expanding',
      }),
    ]
    const result = evaluatePortfolioEcosystemTriggers(undefined, repos, db)
    expect(result).toBeUndefined()
  })

  it('returns undefined when no classified repos', () => {
    const repos = [makeEcology('org/unknown')]
    const result = evaluatePortfolioEcosystemTriggers(
      'consolidation',
      repos,
      db,
    )
    expect(result).toBeUndefined()
  })

  it('returns undefined when snapshot history is insufficient (<14 days)', () => {
    const repos = [
      makeEcology('org/core', {
        horizon: 'perennial',
        role: 'infrastructure',
        phase: 'expanding',
      }),
    ]
    // Only 5 snapshots — below PERSISTENCE_WINDOW_SIZE (14)
    seedSnapshots('org/core', 'expanding', 5)

    const result = evaluatePortfolioEcosystemTriggers(
      'dormancy',
      repos,
      db,
    )
    expect(result).toBeUndefined()
  })

  it('returns triggered: false when data is sufficient but no persistent divergence', () => {
    const repos = [
      makeEcology('org/core', {
        horizon: 'perennial',
        role: 'infrastructure',
        phase: 'consolidating',
      }),
    ]
    // 14 snapshots all aligned with climate
    seedSnapshots('org/core', 'consolidating', 14)

    const result = evaluatePortfolioEcosystemTriggers(
      'consolidation',
      repos,
      db,
    )
    expect(result).toBeDefined()
    expect(result!.triggered).toBe(false)
  })

  it('fires §5.1 when structural core repo is persistently divergent', () => {
    const repos = [
      makeEcology('org/core', {
        horizon: 'perennial',
        role: 'infrastructure',
        phase: 'expanding',
      }),
    ]
    // 14 snapshots with expanding phase vs dormancy climate → divergent
    seedSnapshots('org/core', 'expanding', 14)

    const result = evaluatePortfolioEcosystemTriggers(
      'dormancy',
      repos,
      db,
    )
    expect(result).toBeDefined()
    expect(result!.triggered).toBe(true)
    expect(result!.coreDivergence).toHaveLength(1)
    expect(result!.coreDivergence[0]!.fullName).toBe('org/core')
  })

  it('does not include unclassified repos in trigger evaluation', () => {
    const repos = [
      // Classified — has full persistence window, aligned
      makeEcology('org/core', {
        horizon: 'perennial',
        role: 'infrastructure',
        phase: 'consolidating',
      }),
      // Unclassified — no horizon
      makeEcology('org/nogrove'),
    ]
    seedSnapshots('org/core', 'consolidating', 14)

    const result = evaluatePortfolioEcosystemTriggers(
      'consolidation',
      repos,
      db,
    )
    expect(result).toBeDefined()
    expect(result!.triggered).toBe(false)
    // Only the classified repo participates
    expect(result!.coreDivergence).toHaveLength(0)
  })
})
