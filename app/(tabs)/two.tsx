import AsyncStorage from '@react-native-async-storage/async-storage'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import * as SecureStore from 'expo-secure-store'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { Button, Input, Separator, Text, View, YStack } from 'tamagui'
import { z } from 'zod'

export default function TabTwoScreen() {
  const presses = useSharedValue(0)
  const [storageValue, setStorageValue] = useState<string | null>(null)
  const [secureValue, setSecureValue] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const queryClient = useQueryClient()

  const formSchema = z.object({
    email: z.string().email(),
  })

  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    defaultValues: { email: 'user@example.com' },
    mode: 'onChange',
  })

  const email = watch('email')

  const {
    data: mockProfile,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['mockProfile', email],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 400))
      const parsed = formSchema.parse({ email })
      return { email: parsed.email, plan: 'free' }
    },
    enabled: false,
  })

  const tap = useMemo(
    () =>
      Gesture.Tap().onEnd(() => {
        presses.value += 1
      }),
    [presses]
  )

  const animatedStyle = useAnimatedStyle(() => {
    const scale = 1 + Math.min(presses.value * 0.05, 0.35)
    const rotate = `${Math.min(presses.value * 2.5, 15)}deg`
    return {
      transform: [
        { scale: withSpring(scale) },
        { rotate: withSpring(rotate) as unknown as string },
      ],
    }
  })

  const writeAsyncStorage = async () => {
    try {
      setBusy(true)
      const value = `demo-${Date.now()}`
      await AsyncStorage.setItem('demo:key', value)
      setStorageValue(value)
    } finally {
      setBusy(false)
    }
  }

  const readAsyncStorage = async () => {
    const value = await AsyncStorage.getItem('demo:key')
    setStorageValue(value)
  }

  const secureKey = 'secure_key'

  const writeSecureStore = async () => {
    try {
      setBusy(true)
      const value = `secure-${Date.now()}`
      await SecureStore.setItemAsync(secureKey, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
      })
      setSecureValue(value)
    } finally {
      setBusy(false)
    }
  }

  const readSecureStore = async () => {
    const value = await SecureStore.getItemAsync(secureKey)
    setSecureValue(value)
  }

  return (
    <View flex={1} items="center" justify="center" bg="$background" px="$4" gap="$4">
      <Text fontSize={20} color="$blue10">
        Gesture demo
      </Text>
      <GestureDetector gesture={tap}>
        <Animated.View
          style={[
            {
              width: 200,
              height: 120,
              borderRadius: 12,
              backgroundColor: '#6EE7B7',
              justifyContent: 'center',
              alignItems: 'center',
            },
            animatedStyle,
          ]}
        >
          <YStack gap="$2" alignItems="center">
            <Text fontSize={18} color="$green12">
              Tap me
            </Text>
            <Text fontSize={16} color="$green12">
              Taps: {Math.round(presses.value)}
            </Text>
          </YStack>
        </Animated.View>
      </GestureDetector>
      <Text color="$color" textAlign="center">
        react-native-gesture-handler + Reanimated 簡易デモ
      </Text>
      <Separator />
      <YStack gap="$3" w="100%" maw={360}>
        <Text fontSize={18} color="$color">
          Storage demo
        </Text>
        <Button disabled={busy} onPress={writeAsyncStorage}>
          Write AsyncStorage
        </Button>
        <Button disabled={busy} onPress={readAsyncStorage} variant="outlined">
          Read AsyncStorage
        </Button>
        <Text color="$gray11">Value: {storageValue ?? 'none'}</Text>
        <Separator />
        <Button disabled={busy} onPress={writeSecureStore}>
          Write SecureStore
        </Button>
        <Button disabled={busy} onPress={readSecureStore} variant="outlined">
          Read SecureStore
        </Button>
        <Text color="$gray11">Secure: {secureValue ?? 'none'}</Text>
      </YStack>
      <Separator />
      <YStack gap="$3" w="100%" maw={360}>
        <Text fontSize={18} color="$color">
          Form + Query demo
        </Text>
        <YStack gap="$2">
          <Text color="$gray11">Email (validated by zod)</Text>
          <Input
            value={email}
            onChangeText={(text) => setValue('email', text, { shouldValidate: true })}
            borderColor={errors.email ? '$red8' : '$borderColor'}
            {...register('email', {
              validate: (value) => {
                try {
                  formSchema.parse({ email: value })
                  return true
                } catch (e) {
                  if (e instanceof z.ZodError) {
                    return e.issues?.[0]?.message ?? 'Invalid email'
                  }
                  return 'Invalid email'
                }
              },
            })}
          />
          {errors.email && (
            <Text color="$red10" size="$3">
              {String(errors.email.message)}
            </Text>
          )}
        </YStack>
        <Button
          onPress={() => {
            queryClient.invalidateQueries({ queryKey: ['mockProfile', email] })
            refetch()
          }}
          disabled={isFetching}
        >
          Fetch profile (mock)
        </Button>
        <Text color="$gray11">
          Result: {mockProfile ? `${mockProfile.email} (${mockProfile.plan})` : 'none'}
        </Text>
      </YStack>
    </View>
  )
}
