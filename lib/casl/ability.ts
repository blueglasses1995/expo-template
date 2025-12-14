import {
  AbilityBuilder,
  type MongoAbility,
  createMongoAbility,
} from '@casl/ability'

// --------------------------------------------------
// 型定義
// --------------------------------------------------

// アクション（何ができるか）
export type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage'

// サブジェクト（何に対して）
export type Subjects =
  | 'Task'
  | 'User'
  | 'Profile'
  | 'Settings'
  | 'AdminPanel'
  | 'all'

// Ability 型
export type AppAbility = MongoAbility<[Actions, Subjects]>

// ユーザーロール
export type UserRole = 'guest' | 'user' | 'admin'

// --------------------------------------------------
// Ability 定義
// --------------------------------------------------

/**
 * ロールに基づいて Ability を定義
 */
export function defineAbilityFor(role: UserRole): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(
    createMongoAbility
  )

  switch (role) {
    case 'admin':
      // 管理者: すべての権限
      can('manage', 'all')
      break

    case 'user':
      // 一般ユーザー
      can('read', 'Task')
      can('create', 'Task')
      can('update', 'Task')
      can('delete', 'Task')
      can('read', 'Profile')
      can('update', 'Profile')
      can('read', 'Settings')
      can('update', 'Settings')
      // 管理パネルへのアクセスは不可
      cannot('read', 'AdminPanel')
      break

    case 'guest':
    default:
      // ゲスト: 読み取りのみ
      can('read', 'Task')
      can('read', 'Profile')
      break
  }

  return build()
}

// デフォルトの Ability（ゲスト）
export const defaultAbility = defineAbilityFor('guest')
