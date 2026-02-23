import type { DensityObservation, RepositoryEcology, StructuralSignals } from '@grove/core'
import Database from 'better-sqlite3'
import { beforeEach, describe, expect, it } from 'vitest'

import { createDb, type GroveDb } from '../client'
import { ecologySnapshots, repositories } from '../schema'
import {
  getLatestSnapshot,
  getSnapshotHistory,
  recordSnapshot,
  recordSnapshotBatch,
  upsertRepositories,
  upsertRepository,
} from '../snapshots'

let db: GroveDb

beforeEach(() => {
  const sqlite = new Database(':memory:')
  db = createDb(sqlite)
})

function makeRepo(fullName = 'owner/repo') {
  return {
    fullName,
    htmlUrl: `https://github.com/${fullName}`,
    defaultBranch: 'main',
    pushedAt: '2025-01-15T00:00:00Z',
    sizeKb: 1024,
  }
}

function makeEcology(fullName = 'owner/repo'): RepositoryEcology {
  return {
    fullName,
    htmlUrl: `https://github.com/${fullName}`,
    classified: true,
    declaration: {
      intent: 'A test project',
      horizon: 'perennial',
      role: 'library',
      phase: 'consolidating',
      steward: 'alice',
      consolidation_interval_days: 90,
    },
  }
}

function makeSignals(): StructuralSignals {
  return {
    fileCount: 42,
    commitsLast30d: 5,
    commitsLast90d: 15,
    dependencyManifestsObserved: ['package.json', 'go.mod'],
    ecosystemDependencyCount: 3,
    observedAt: '2025-01-15T00:00:00Z',
  }
}

function makeDensity(): DensityObservation {
  return {
    tier: 'thickening',
    description: 'A developing structure with moderate file count and observable change.',
    signals: makeSignals(),
  }
}

describe('upsertRepository', () => {
  it('inserts a new repository', () => {
    upsertRepository(makeRepo(), db)
    const rows = db.select().from(repositories).all()
    expect(rows).toHaveLength(1)
    expect(rows[0]!.fullName).toBe('owner/repo')
  })

  it('updates on conflict', () => {
    upsertRepository(makeRepo(), db)
    upsertRepository({ ...makeRepo(), defaultBranch: 'develop' }, db)
    const rows = db.select().from(repositories).all()
    expect(rows).toHaveLength(1)
    expect(rows[0]!.defaultBranch).toBe('develop')
  })
})

describe('upsertRepositories', () => {
  it('upserts multiple repos in a transaction', () => {
    upsertRepositories(
      [makeRepo('a/one'), makeRepo('b/two'), makeRepo('c/three')],
      db,
    )
    const rows = db.select().from(repositories).all()
    expect(rows).toHaveLength(3)
  })
})

describe('recordSnapshot', () => {
  it('records and retrieves a snapshot', () => {
    upsertRepository(makeRepo(), db)
    const inserted = recordSnapshot(makeEcology(), makeSignals(), makeDensity(), db)
    expect(inserted).toBe(true)

    const latest = getLatestSnapshot('owner/repo', db)
    expect(latest).not.toBeNull()
    expect(latest!.fullName).toBe('owner/repo')
    expect(latest!.classified).toBe(true)
    expect(latest!.intent).toBe('A test project')
    expect(latest!.horizon).toBe('perennial')
    expect(latest!.role).toBe('library')
    expect(latest!.phase).toBe('consolidating')
    expect(latest!.steward).toBe('alice')
    expect(latest!.consolidationIntervalDays).toBe(90)
    expect(latest!.fileCount).toBe(42)
    expect(latest!.commitsLast30d).toBe(5)
    expect(latest!.commitsLast90d).toBe(15)
    expect(latest!.dependencyManifestsObserved).toBe(
      JSON.stringify(['package.json', 'go.mod']),
    )
    expect(latest!.ecosystemDependencyCount).toBe(3)
    expect(latest!.densityTier).toBe('thickening')
    expect(latest!.densityDescription).toContain('developing structure')
  })

  it('respects minimum interval', () => {
    upsertRepository(makeRepo(), db)
    const first = recordSnapshot(makeEcology(), undefined, undefined, db)
    expect(first).toBe(true)

    const second = recordSnapshot(makeEcology(), undefined, undefined, db)
    expect(second).toBe(false)

    const history = getSnapshotHistory('owner/repo', 100, db)
    expect(history).toHaveLength(1)
  })

  it('preserves nullable fields', () => {
    upsertRepository(makeRepo(), db)
    const ecology: RepositoryEcology = {
      fullName: 'owner/repo',
      htmlUrl: 'https://github.com/owner/repo',
      classified: false,
    }
    recordSnapshot(ecology, undefined, undefined, db)

    const latest = getLatestSnapshot('owner/repo', db)
    expect(latest).not.toBeNull()
    expect(latest!.classified).toBe(false)
    expect(latest!.intent).toBeNull()
    expect(latest!.horizon).toBeNull()
    expect(latest!.fileCount).toBeNull()
    expect(latest!.densityTier).toBeNull()
  })
})

describe('recordSnapshotBatch', () => {
  it('records multiple snapshots in a transaction', () => {
    const repos = ['a/one', 'b/two', 'c/three']
    upsertRepositories(repos.map(makeRepo), db)

    recordSnapshotBatch(
      repos.map((name) => ({ ecology: makeEcology(name) })),
      db,
    )

    for (const name of repos) {
      expect(getLatestSnapshot(name, db)).not.toBeNull()
    }
  })

  it('respects per-repo interval in batch', () => {
    upsertRepositories([makeRepo('a/one'), makeRepo('b/two')], db)

    // Record a snapshot for a/one only
    recordSnapshot(makeEcology('a/one'), undefined, undefined, db)

    // Batch should skip a/one but record b/two
    recordSnapshotBatch(
      [
        { ecology: makeEcology('a/one') },
        { ecology: makeEcology('b/two') },
      ],
      db,
    )

    expect(getSnapshotHistory('a/one', 100, db)).toHaveLength(1)
    expect(getSnapshotHistory('b/two', 100, db)).toHaveLength(1)
  })
})

describe('getSnapshotHistory', () => {
  it('returns history in descending order with limit', () => {
    upsertRepository(makeRepo(), db)

    // Insert 3 snapshots with different timestamps by manipulating the DB directly
    for (let i = 0; i < 3; i++) {
      db.insert(ecologySnapshots)
        .values({
          fullName: 'owner/repo',
          observedAt: `2025-01-${String(10 + i).padStart(2, '0')}T00:00:00Z`,
          classified: true,
        })
        .run()
    }

    const all = getSnapshotHistory('owner/repo', 100, db)
    expect(all).toHaveLength(3)
    expect(all[0]!.observedAt).toBe('2025-01-12T00:00:00Z')
    expect(all[2]!.observedAt).toBe('2025-01-10T00:00:00Z')

    const limited = getSnapshotHistory('owner/repo', 2, db)
    expect(limited).toHaveLength(2)
  })
})
