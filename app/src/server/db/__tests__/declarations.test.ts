import type { GroveDeclaration } from '@grove/core'
import Database from 'better-sqlite3'
import { beforeEach, describe, expect, it } from 'vitest'

import { createDb, type GroveDb } from '../client'
import {
  getDeclarationHistory,
  getLatestDeclaration,
  recordDeclarationIfChanged,
} from '../declarations'
import { upsertRepository } from '../snapshots'

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
  }
}

const baseDeclaration: GroveDeclaration = {
  intent: 'A stewardship engine',
  horizon: 'perennial',
  role: 'application',
  phase: 'consolidating',
  steward: 'alice',
  consolidation_interval_days: 90,
}

describe('recordDeclarationIfChanged', () => {
  it('records initial declaration', () => {
    upsertRepository(makeRepo(), db)
    const inserted = recordDeclarationIfChanged(
      'owner/repo',
      baseDeclaration,
      true,
      db,
    )
    expect(inserted).toBe(true)

    const latest = getLatestDeclaration('owner/repo', db)
    expect(latest).not.toBeNull()
    expect(latest!.intent).toBe('A stewardship engine')
    expect(latest!.horizon).toBe('perennial')
    expect(latest!.role).toBe('application')
    expect(latest!.phase).toBe('consolidating')
    expect(latest!.steward).toBe('alice')
    expect(latest!.consolidationIntervalDays).toBe(90)
    expect(latest!.classified).toBe(true)
  })

  it('skips when declaration is unchanged', () => {
    upsertRepository(makeRepo(), db)
    recordDeclarationIfChanged('owner/repo', baseDeclaration, true, db)
    const skipped = recordDeclarationIfChanged(
      'owner/repo',
      baseDeclaration,
      true,
      db,
    )
    expect(skipped).toBe(false)

    const history = getDeclarationHistory('owner/repo', 100, db)
    expect(history).toHaveLength(1)
  })

  it('detects change in a single field', () => {
    upsertRepository(makeRepo(), db)
    recordDeclarationIfChanged('owner/repo', baseDeclaration, true, db)

    const changed = recordDeclarationIfChanged(
      'owner/repo',
      { ...baseDeclaration, phase: 'pruning' },
      true,
      db,
    )
    expect(changed).toBe(true)

    const history = getDeclarationHistory('owner/repo', 100, db)
    expect(history).toHaveLength(2)
    expect(history[0]!.phase).toBe('pruning')
    expect(history[1]!.phase).toBe('consolidating')
  })

  it('records classified → unclassified transition', () => {
    upsertRepository(makeRepo(), db)
    recordDeclarationIfChanged('owner/repo', baseDeclaration, true, db)

    const changed = recordDeclarationIfChanged(
      'owner/repo',
      undefined,
      false,
      db,
    )
    expect(changed).toBe(true)

    const latest = getLatestDeclaration('owner/repo', db)
    expect(latest!.classified).toBe(false)
    expect(latest!.intent).toBeNull()
  })

  it('records unclassified → classified transition', () => {
    upsertRepository(makeRepo(), db)
    recordDeclarationIfChanged('owner/repo', undefined, false, db)

    const changed = recordDeclarationIfChanged(
      'owner/repo',
      baseDeclaration,
      true,
      db,
    )
    expect(changed).toBe(true)

    const history = getDeclarationHistory('owner/repo', 100, db)
    expect(history).toHaveLength(2)
    expect(history[0]!.classified).toBe(true)
    expect(history[1]!.classified).toBe(false)
  })

  it('detects change in consolidation_interval_days', () => {
    upsertRepository(makeRepo(), db)
    recordDeclarationIfChanged('owner/repo', baseDeclaration, true, db)

    const changed = recordDeclarationIfChanged(
      'owner/repo',
      { ...baseDeclaration, consolidation_interval_days: 180 },
      true,
      db,
    )
    expect(changed).toBe(true)
  })
})

describe('getDeclarationHistory', () => {
  it('returns history in descending order', () => {
    upsertRepository(makeRepo(), db)
    recordDeclarationIfChanged('owner/repo', baseDeclaration, true, db)
    recordDeclarationIfChanged(
      'owner/repo',
      { ...baseDeclaration, phase: 'pruning' },
      true,
      db,
    )
    recordDeclarationIfChanged(
      'owner/repo',
      { ...baseDeclaration, phase: 'resting' },
      true,
      db,
    )

    const history = getDeclarationHistory('owner/repo', 100, db)
    expect(history).toHaveLength(3)
    // Most recent first
    expect(history[0]!.phase).toBe('resting')
    expect(history[2]!.phase).toBe('consolidating')
  })
})
