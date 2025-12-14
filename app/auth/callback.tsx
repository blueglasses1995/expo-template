import type { GoTrueClient } from '@supabase/auth-js'
import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { Spinner, Text, YStack } from 'tamagui'
import { isSupabaseEnabled, supabase } from '../../lib/supabase'

/**
 * OAuth/Magic Link コールバックハンドラー
 *
 * Deep Link から受け取ったトークンでセッションを設定
 */
export default function AuthCallbackScreen() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase が設定されていない場合はスキップ
        if (!isSupabaseEnabled || !supabase) {
          router.replace('/')
          return
        }

        const auth = supabase.auth as unknown as GoTrueClient
        const url = await Linking.getInitialURL()

        if (url) {
          const parsedUrl = new URL(url)
          const accessToken = parsedUrl.searchParams.get('access_token')
          const refreshToken = parsedUrl.searchParams.get('refresh_token')

          if (accessToken && refreshToken) {
            await auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })
          }
        }

        // ホームに戻る
        router.replace('/')
      } catch (error) {
        console.error('Auth callback error:', error)
        router.replace('/')
      }
    }

    handleCallback()
  }, [router])

  return (
    <YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
      <Spinner size="large" />
      <Text>認証中...</Text>
    </YStack>
  )
}
