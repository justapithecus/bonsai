import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import * as schema from './schema'

let instance: ReturnType<typeof drizzle<typeof schema>> | undefined

/**
 * Returns a singleton Drizzle ORM instance backed by SQLite.
 *
 * - Reads GROVE_DB_PATH env var (default: data/grove.db)
 * - Creates parent directories if absent
 * - Enables WAL mode and foreign keys
 * - Runs migrations on first connection
 */
export function getDb() {
  if (instance) return instance

  const dbPath = process.env.GROVE_DB_PATH ?? 'data/grove.db'
  const absolutePath = resolve(dbPath)

  // Ensure parent directory exists
  const dir = dirname(absolutePath)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  const sqlite = new Database(absolutePath)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  const db = drizzle(sqlite, { schema })

  // Run migrations
  const migrationsFolder = resolve(import.meta.dirname, '../../../drizzle')
  migrate(db, { migrationsFolder })

  instance = db
  return db
}

/**
 * Create a Drizzle instance from an existing better-sqlite3 Database.
 * Used for testing with in-memory databases.
 */
export function createDb(sqlite: Database.Database) {
  sqlite.pragma('foreign_keys = ON')
  const db = drizzle(sqlite, { schema })
  migrate(db, { migrationsFolder: resolve(import.meta.dirname, '../../../drizzle') })
  return db
}

export type GroveDb = ReturnType<typeof getDb>
