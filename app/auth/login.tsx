import { useToastController } from '@tamagui/toast'
import { useRouter } from 'expo-router'
import { useAuth } from 'hooks/useAuth'
import { useState } from 'react'
import { Platform } from 'react-native'
import { Button, H2, Input, Separator, Spinner, Text, XStack, YStack } from 'tamagui'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [authMethod, setAuthMethod] = useState<'otp' | 'magic-link' | null>(null)

  const { signInWithOtp, signInWithMagicLink, signInWithGoogle, signInWithApple } =
    useAuth()
  const toast = useToastController()
  const router = useRouter()

  const handleOtpLogin = async () => {
    if (!email) {
      toast.show('メールアドレスを入力してください', { preset: 'error' })
      return
    }

    setLoading(true)
    setAuthMethod('otp')

    const { error } = await signInWithOtp(email)

    setLoading(false)

    if (error) {
      toast.show(error.message, { preset: 'error' })
      return
    }

    toast.show('認証コードを送信しました', { preset: 'done' })
    router.push({
      pathname: '/auth/verify',
      params: { email },
    })
  }

  const handleMagicLinkLogin = async () => {
    if (!email) {
      toast.show('メールアドレスを入力してください', { preset: 'error' })
      return
    }

    setLoading(true)
    setAuthMethod('magic-link')

    const { error } = await signInWithMagicLink(email)

    setLoading(false)

    if (error) {
      toast.show(error.message, { preset: 'error' })
      return
    }

    toast.show('ログインリンクを送信しました。メールを確認してください。', {
      preset: 'done',
    })
  }

  const handleGoogleLogin = async () => {
    setLoading(true)

    const { error } = await signInWithGoogle()

    setLoading(false)

    if (error) {
      toast.show(error.message, { preset: 'error' })
      return
    }
  }

  const handleAppleLogin = async () => {
    setLoading(true)

    const { error } = await signInWithApple()

    setLoading(false)

    if (error) {
      toast.show(error.message, { preset: 'error' })
      return
    }
  }

  return (
    <YStack flex={1} padding="$4" gap="$4" backgroundColor="$background">
      <YStack gap="$2" marginTop="$8">
        <H2 textAlign="center">ログイン</H2>
        <Text textAlign="center" color="$gray10">
          パスワードなしでログイン
        </Text>
      </YStack>

      {/* メールアドレス入力 */}
      <YStack gap="$3" marginTop="$4">
        <Input
          placeholder="メールアドレス"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          size="$4"
        />

        {/* OTPボタン */}
        <Button size="$4" theme="active" onPress={handleOtpLogin} disabled={loading}>
          {loading && authMethod === 'otp' ? <Spinner /> : '認証コードでログイン'}
        </Button>

        {/* Magic Linkボタン */}
        <Button
          size="$4"
          variant="outlined"
          onPress={handleMagicLinkLogin}
          disabled={loading}
        >
          {loading && authMethod === 'magic-link' ? (
            <Spinner />
          ) : (
            'メールリンクでログイン'
          )}
        </Button>
      </YStack>

      {/* 区切り線 */}
      <XStack alignItems="center" gap="$3" marginVertical="$4">
        <Separator flex={1} />
        <Text color="$gray10">または</Text>
        <Separator flex={1} />
      </XStack>

      {/* ソーシャルログイン */}
      <YStack gap="$3">
        {/* Googleログイン */}
        <Button
          size="$4"
          backgroundColor="$gray2"
          color="$gray12"
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          Googleでログイン
        </Button>

        {/* Appleログイン（iOSのみネイティブ） */}
        {Platform.OS === 'ios' ? (
          <Button
            size="$4"
            backgroundColor="$gray12"
            color="$gray1"
            onPress={handleAppleLogin}
            disabled={loading}
          >
            Appleでログイン
          </Button>
        ) : (
          <Button
            size="$4"
            backgroundColor="$gray12"
            color="$gray1"
            onPress={handleAppleLogin}
            disabled={loading}
          >
            Appleでログイン
          </Button>
        )}
      </YStack>
    </YStack>
  )
}
