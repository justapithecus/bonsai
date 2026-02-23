import Database from 'better-sqlite3'
import { beforeEach, describe, expect, it } from 'vitest'

import { createDb, type GroveDb } from '../client'
import {
  getCurrentClimate,
  getClimateHistory,
  persistClimate,
} from '../climate-store'

let db: GroveDb

beforeEach(() => {
  const sqlite = new Database(':memory:')
  db = createDb(sqlite)
})

describe('getCurrentClimate', () => {
  it('returns undefined when no climate has been declared', () => {
    expect(getCurrentClimate('alice', db)).toBeUndefined()
  })

  it('returns the most recently declared climate for a steward', () => {
    persistClimate('expansion', 'alice', db)
    expect(getCurrentClimate('alice', db)).toBe('expansion')

    persistClimate('consolidation', 'alice', db)
    expect(getCurrentClimate('alice', db)).toBe('consolidation')
  })

  it('isolates climate by steward login', () => {
    persistClimate('expansion', 'alice', db)
    persistClimate('dormancy', 'bob', db)

    expect(getCurrentClimate('alice', db)).toBe('expansion')
    expect(getCurrentClimate('bob', db)).toBe('dormancy')
  })
})

describe('persistClimate', () => {
  it('records climate with declared_by', () => {
    persistClimate('dormancy', 'bob', db)

    const history = getClimateHistory('bob', 100, db)
    expect(history).toHaveLength(1)
    expect(history[0]!.climate).toBe('dormancy')
    expect(history[0]!.declaredBy).toBe('bob')
    expect(history[0]!.declaredAt).toBeTruthy()
  })
})

describe('getClimateHistory', () => {
  it('returns history in descending order', () => {
    persistClimate('expansion', 'alice', db)
    persistClimate('consolidation', 'alice', db)
    persistClimate('pruning', 'alice', db)

    const history = getClimateHistory('alice', 100, db)
    expect(history).toHaveLength(3)
    expect(history[0]!.climate).toBe('pruning')
    expect(history[2]!.climate).toBe('expansion')
  })

  it('respects limit parameter', () => {
    persistClimate('expansion', 'alice', db)
    persistClimate('consolidation', 'alice', db)
    persistClimate('pruning', 'alice', db)

    const history = getClimateHistory('alice', 2, db)
    expect(history).toHaveLength(2)
  })

  it('only returns history for the specified steward', () => {
    persistClimate('expansion', 'alice', db)
    persistClimate('dormancy', 'bob', db)
    persistClimate('consolidation', 'alice', db)

    const aliceHistory = getClimateHistory('alice', 100, db)
    expect(aliceHistory).toHaveLength(2)
    expect(aliceHistory[0]!.climate).toBe('consolidation')

    const bobHistory = getClimateHistory('bob', 100, db)
    expect(bobHistory).toHaveLength(1)
    expect(bobHistory[0]!.climate).toBe('dormancy')
  })
})
