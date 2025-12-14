import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import { AbilityContext, defineAbilityFor, type UserRole } from '../lib/casl'

type Props = {
  children: ReactNode
}

/**
 * Ability Provider
 *
 * 認証状態に基づいてユーザーの権限を設定
 */
export function AbilityProvider({ children }: Props) {
  const { user } = useAuth()

  // ユーザーのロールを決定（実際のアプリでは user.role などから取得）
  const role: UserRole = useMemo(() => {
    if (!user) return 'guest'

    // 例: メタデータからロールを取得
    const userRole = user.user_metadata?.role as UserRole | undefined
    if (userRole === 'admin') return 'admin'

    return 'user'
  }, [user])

  // ロールに基づいて Ability を生成
  const ability = useMemo(() => defineAbilityFor(role), [role])

  return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>
}
