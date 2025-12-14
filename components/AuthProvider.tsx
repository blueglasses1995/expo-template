import type { GoTrueClient } from '@supabase/auth-js'
import { type ReactNode, useEffect, useState } from 'react'
import {
  AuthContext,
  type Session,
  signInWithApple,
  signInWithGoogle,
  signInWithMagicLink,
  signInWithOtp,
  signOut,
  type User,
  verifyOtp,
} from '../hooks/useAuth'
import { isSupabaseEnabled, supabase } from '../lib/supabase'

type Props = {
  children: ReactNode
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Supabase が設定されていない場合はスキップ
    if (!isSupabaseEnabled || !supabase) {
      setLoading(false)
      setInitialized(true)
      return
    }

    const auth = supabase.auth as unknown as GoTrueClient

    // 初期セッションの取得
    const initSession = async () => {
      try {
        const {
          data: { session },
        } = await auth.getSession()
        setSession(session as Session | null)
        setUser((session?.user as User) ?? null)
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }

    initSession()

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = auth.onAuthStateChange((_event, session) => {
      setSession(session as Session | null)
      setUser((session?.user as User) ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        initialized,
        signInWithMagicLink,
        signInWithOtp,
        verifyOtp,
        signInWithGoogle,
        signInWithApple,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
