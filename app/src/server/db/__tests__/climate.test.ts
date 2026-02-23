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
    expect(getCurrentClimate(db)).toBeUndefined()
  })

  it('returns the most recently declared climate', () => {
    persistClimate('expansion', 'alice', db)
    expect(getCurrentClimate(db)).toBe('expansion')

    persistClimate('consolidation', 'alice', db)
    expect(getCurrentClimate(db)).toBe('consolidation')
  })
})

describe('persistClimate', () => {
  it('records climate with declared_by', () => {
    persistClimate('dormancy', 'bob', db)

    const history = getClimateHistory(100, db)
    expect(history).toHaveLength(1)
    expect(history[0]!.climate).toBe('dormancy')
    expect(history[0]!.declaredBy).toBe('bob')
    expect(history[0]!.declaredAt).toBeTruthy()
  })

  it('records climate without declared_by', () => {
    persistClimate('pruning', undefined, db)

    const history = getClimateHistory(100, db)
    expect(history).toHaveLength(1)
    expect(history[0]!.declaredBy).toBeNull()
  })
})

describe('getClimateHistory', () => {
  it('returns history in descending order', () => {
    persistClimate('expansion', 'alice', db)
    persistClimate('consolidation', 'alice', db)
    persistClimate('pruning', 'alice', db)

    const history = getClimateHistory(100, db)
    expect(history).toHaveLength(3)
    expect(history[0]!.climate).toBe('pruning')
    expect(history[2]!.climate).toBe('expansion')
  })

  it('respects limit parameter', () => {
    persistClimate('expansion', 'alice', db)
    persistClimate('consolidation', 'alice', db)
    persistClimate('pruning', 'alice', db)

    const history = getClimateHistory(2, db)
    expect(history).toHaveLength(2)
  })
})
