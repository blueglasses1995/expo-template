import { useAbility } from '@casl/react'
import { useMemo } from 'react'
import { type Actions, type AppAbility, type Subjects, AbilityContext } from '../lib/casl'

/**
 * 権限チェック用のフック
 *
 * @example
 * const { can, cannot } = useCan()
 *
 * if (can('create', 'Task')) {
 *   // タスク作成が可能
 * }
 *
 * if (cannot('read', 'AdminPanel')) {
 *   // 管理パネルへのアクセス不可
 * }
 */
export function useCan() {
  const ability = useAbility(AbilityContext) as AppAbility

  return useMemo(
    () => ({
      /**
       * 指定のアクションが許可されているか
       */
      can: (action: Actions, subject: Subjects) => ability.can(action, subject),

      /**
       * 指定のアクションが禁止されているか
       */
      cannot: (action: Actions, subject: Subjects) =>
        ability.cannot(action, subject),

      /**
       * Ability インスタンスを直接取得
       */
      ability,
    }),
    [ability]
  )
}
