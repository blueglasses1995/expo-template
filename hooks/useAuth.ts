import type { GoTrueClient } from '@supabase/auth-js'
import * as AppleAuthentication from 'expo-apple-authentication'
import { makeRedirectUri } from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import { createContext, useContext } from 'react'
import { Platform } from 'react-native'
import { isSupabaseEnabled, supabase } from '../lib/supabase'

// WebブラウザのAuthセッションを完了させる
WebBrowser.maybeCompleteAuthSession()

// --------------------------------------------------
// 型定義
// --------------------------------------------------

// Supabaseの認証エラー型
export type AuthError = {
  message: string
  status?: number
}

// Supabaseのユーザー型
export type User = {
  id: string
  email?: string
  phone?: string
  created_at?: string
  updated_at?: string
  app_metadata?: Record<string, unknown>
  user_metadata?: Record<string, unknown>
}

// Supabaseのセッション型
export type Session = {
  access_token: string
  refresh_token: string
  expires_at?: number
  expires_in?: number
  token_type?: string
  user: User
}

export type AuthState = {
  user: User | null
  session: Session | null
  loading: boolean
  initialized: boolean
}

export type AuthContextType = AuthState & {
  // Magic Link（メールリンク）
  signInWithMagicLink: (email: string) => Promise<{ error: AuthError | null }>

  // OTP（ワンタイムパスワード）
  signInWithOtp: (email: string) => Promise<{ error: AuthError | null }>
  verifyOtp: (
    email: string,
    token: string
  ) => Promise<{ error: AuthError | null }>

  // OAuth（ソーシャルログイン）
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  signInWithApple: () => Promise<{ error: AuthError | null }>

  // サインアウト
  signOut: () => Promise<{ error: AuthError | null }>
}

// --------------------------------------------------
// Context
// --------------------------------------------------

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// --------------------------------------------------
// ヘルパー: Supabase Auth クライアントを取得
// --------------------------------------------------

function getAuth(): GoTrueClient | null {
  if (!isSupabaseEnabled || !supabase) {
    return null
  }
  return supabase.auth as unknown as GoTrueClient
}

// Supabase未設定時のエラー
const notConfiguredError: AuthError = {
  message: 'Supabase is not configured. Please set environment variables.',
}

// --------------------------------------------------
// 認証関数
// --------------------------------------------------

/**
 * Magic Link でサインイン
 * メールにログインリンクを送信
 */
export async function signInWithMagicLink(
  email: string
): Promise<{ error: AuthError | null }> {
  const auth = getAuth()
  if (!auth) return { error: notConfiguredError }

  const redirectUrl = makeRedirectUri({
    scheme: 'myapp', // app.json の scheme に合わせる
    path: 'auth/callback',
  })

  const { error } = await auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl,
    },
  })

  return { error }
}

/**
 * OTP（ワンタイムパスワード）を送信
 * メールに6桁のコードを送信
 */
export async function signInWithOtp(
  email: string
): Promise<{ error: AuthError | null }> {
  const auth = getAuth()
  if (!auth) return { error: notConfiguredError }

  const { error } = await auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true, // ユーザーが存在しない場合は作成
    },
  })

  return { error }
}

/**
 * OTPを検証
 */
export async function verifyOtp(
  email: string,
  token: string
): Promise<{ error: AuthError | null }> {
  const auth = getAuth()
  if (!auth) return { error: notConfiguredError }

  const { error } = await auth.verifyOtp({
    email,
    token,
    type: 'email',
  })

  return { error }
}

/**
 * Googleでサインイン
 */
export async function signInWithGoogle(): Promise<{
  error: AuthError | null
}> {
  const auth = getAuth()
  if (!auth) return { error: notConfiguredError }

  const redirectUrl = makeRedirectUri({
    scheme: 'myapp',
    path: 'auth/callback',
  })

  const { data, error } = await auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true,
    },
  })

  if (error) return { error }

  if (data?.url) {
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl)

    if (result.type === 'success' && result.url) {
      // URLからセッションを取得
      const url = new URL(result.url)
      const accessToken = url.searchParams.get('access_token')
      const refreshToken = url.searchParams.get('refresh_token')

      if (accessToken && refreshToken) {
        const { error: sessionError } = await auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        return { error: sessionError }
      }
    }
  }

  return { error: null }
}

/**
 * Apple でサインイン（iOSネイティブ）
 */
export async function signInWithApple(): Promise<{
  error: AuthError | null
}> {
  const auth = getAuth()
  if (!auth) return { error: notConfiguredError }

  // iOSのみネイティブApple認証を使用
  if (Platform.OS === 'ios') {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      })

      if (credential.identityToken) {
        const { error } = await auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        })
        return { error }
      }

      return { error: null }
    } catch (e: unknown) {
      if (
        typeof e === 'object' &&
        e !== null &&
        'code' in e &&
        e.code === 'ERR_REQUEST_CANCELED'
      ) {
        // ユーザーがキャンセルした場合
        return { error: null }
      }
      throw e
    }
  }

  // Web/Androidの場合はOAuthフローを使用
  const redirectUrl = makeRedirectUri({
    scheme: 'myapp',
    path: 'auth/callback',
  })

  const { data, error } = await auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true,
    },
  })

  if (error) return { error }

  if (data?.url) {
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl)

    if (result.type === 'success' && result.url) {
      const url = new URL(result.url)
      const accessToken = url.searchParams.get('access_token')
      const refreshToken = url.searchParams.get('refresh_token')

      if (accessToken && refreshToken) {
        const { error: sessionError } = await auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        return { error: sessionError }
      }
    }
  }

  return { error: null }
}

/**
 * サインアウト
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  const auth = getAuth()
  if (!auth) return { error: notConfiguredError }

  const { error } = await auth.signOut()
  return { error }
}
