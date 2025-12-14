import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// Drizzle schema for todos table
export const todos = sqliteTable('todos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export type Todo = typeof todos.$inferSelect
export type NewTodo = typeof todos.$inferInsert
