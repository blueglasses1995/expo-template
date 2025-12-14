import { drizzle } from 'drizzle-orm/expo-sqlite'
import { openDatabaseSync } from 'expo-sqlite'
import * as schema from './schema'

// Open SQLite database
const expoDb = openDatabaseSync('app.db', { enableChangeListener: true })

// Create Drizzle instance with schema
export const db = drizzle(expoDb, { schema })

// Export schema for convenience
export { schema }
export * from './schema'
