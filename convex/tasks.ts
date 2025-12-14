import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// タスク一覧を取得
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('tasks').collect()
  },
})

// タスクを作成
export const create = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert('tasks', {
      text: args.text,
      isCompleted: false,
      createdAt: Date.now(),
    })
  },
})

// タスクの完了状態を切り替え
export const toggle = mutation({
  args: { id: v.id('tasks') },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id)
    if (!task) {
      throw new Error('タスクが見つかりません')
    }
    await ctx.db.patch(args.id, { isCompleted: !task.isCompleted })
  },
})

// タスクを削除
export const remove = mutation({
  args: { id: v.id('tasks') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})
