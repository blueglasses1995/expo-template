import { useToastController } from '@tamagui/toast'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAuth } from 'hooks/useAuth'
import { useState } from 'react'
import { Button, H2, Input, Spinner, Text, YStack } from 'tamagui'

export default function VerifyScreen() {
  const { email } = useLocalSearchParams<{ email: string }>()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const { verifyOtp, signInWithOtp } = useAuth()
  const toast = useToastController()
  const router = useRouter()

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      toast.show('6桁の認証コードを入力してください', { preset: 'error' })
      return
    }

    setLoading(true)

    const { error } = await verifyOtp(email ?? '', code)

    setLoading(false)

    if (error) {
      toast.show(error.message, { preset: 'error' })
      return
    }

    toast.show('ログインしました', { preset: 'done' })
    router.replace('/')
  }

  const handleResend = async () => {
    if (!email) return

    setLoading(true)

    const { error } = await signInWithOtp(email)

    setLoading(false)

    if (error) {
      toast.show(error.message, { preset: 'error' })
      return
    }

    toast.show('認証コードを再送信しました', { preset: 'done' })
  }

  return (
    <YStack flex={1} padding="$4" gap="$4" backgroundColor="$background">
      <YStack gap="$2" marginTop="$8">
        <H2 textAlign="center">認証コードを入力</H2>
        <Text textAlign="center" color="$gray10">
          {email} に送信された6桁のコードを入力してください
        </Text>
      </YStack>

      <YStack gap="$3" marginTop="$4">
        <Input
          placeholder="000000"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
          size="$5"
          textAlign="center"
          letterSpacing={8}
          fontSize="$8"
        />

        <Button
          size="$4"
          theme="active"
          onPress={handleVerify}
          disabled={loading || code.length !== 6}
        >
          {loading ? <Spinner /> : '確認'}
        </Button>

        <Button size="$4" variant="outlined" onPress={handleResend} disabled={loading}>
          コードを再送信
        </Button>
      </YStack>
    </YStack>
  )
}
