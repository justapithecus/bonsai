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

// Stable user IDs (immutable, unlike GitHub login)
const ALICE_ID = 1001
const BOB_ID = 2002

describe('getCurrentClimate', () => {
  it('returns undefined when no climate has been declared', () => {
    expect(getCurrentClimate(ALICE_ID, db)).toBeUndefined()
  })

  it('returns the most recently declared climate for a steward', () => {
    persistClimate('expansion', ALICE_ID, 'alice', db)
    expect(getCurrentClimate(ALICE_ID, db)).toBe('expansion')

    persistClimate('consolidation', ALICE_ID, 'alice', db)
    expect(getCurrentClimate(ALICE_ID, db)).toBe('consolidation')
  })

  it('isolates climate by steward user ID', () => {
    persistClimate('expansion', ALICE_ID, 'alice', db)
    persistClimate('dormancy', BOB_ID, 'bob', db)

    expect(getCurrentClimate(ALICE_ID, db)).toBe('expansion')
    expect(getCurrentClimate(BOB_ID, db)).toBe('dormancy')
  })

  it('maintains continuity after username change', () => {
    // Alice declares under her original login
    persistClimate('expansion', ALICE_ID, 'alice', db)
    // Alice renames her GitHub account
    persistClimate('consolidation', ALICE_ID, 'alice-new', db)

    // Reads by immutable ID find both, returning the latest
    expect(getCurrentClimate(ALICE_ID, db)).toBe('consolidation')
    const history = getClimateHistory(ALICE_ID, 100, db)
    expect(history).toHaveLength(2)
  })
})

describe('persistClimate', () => {
  it('records climate with user ID and login', () => {
    persistClimate('dormancy', BOB_ID, 'bob', db)

    const history = getClimateHistory(BOB_ID, 100, db)
    expect(history).toHaveLength(1)
    expect(history[0]!.climate).toBe('dormancy')
    expect(history[0]!.declaredBy).toBe('bob')
    expect(history[0]!.declaredById).toBe(BOB_ID)
    expect(history[0]!.declaredAt).toBeTruthy()
  })
})

describe('getClimateHistory', () => {
  it('returns history in descending order', () => {
    persistClimate('expansion', ALICE_ID, 'alice', db)
    persistClimate('consolidation', ALICE_ID, 'alice', db)
    persistClimate('pruning', ALICE_ID, 'alice', db)

    const history = getClimateHistory(ALICE_ID, 100, db)
    expect(history).toHaveLength(3)
    expect(history[0]!.climate).toBe('pruning')
    expect(history[2]!.climate).toBe('expansion')
  })

  it('respects limit parameter', () => {
    persistClimate('expansion', ALICE_ID, 'alice', db)
    persistClimate('consolidation', ALICE_ID, 'alice', db)
    persistClimate('pruning', ALICE_ID, 'alice', db)

    const history = getClimateHistory(ALICE_ID, 2, db)
    expect(history).toHaveLength(2)
  })

  it('only returns history for the specified steward', () => {
    persistClimate('expansion', ALICE_ID, 'alice', db)
    persistClimate('dormancy', BOB_ID, 'bob', db)
    persistClimate('consolidation', ALICE_ID, 'alice', db)

    const aliceHistory = getClimateHistory(ALICE_ID, 100, db)
    expect(aliceHistory).toHaveLength(2)
    expect(aliceHistory[0]!.climate).toBe('consolidation')

    const bobHistory = getClimateHistory(BOB_ID, 100, db)
    expect(bobHistory).toHaveLength(1)
    expect(bobHistory[0]!.climate).toBe('dormancy')
  })
})
