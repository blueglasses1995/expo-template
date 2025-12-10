import AsyncStorage from '@react-native-async-storage/async-storage'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import * as LocalAuthentication from 'expo-local-authentication'
import * as Notifications from 'expo-notifications'
import * as ScreenOrientation from 'expo-screen-orientation'
import * as SecureStore from 'expo-secure-store'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Platform, ScrollView } from 'react-native'
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
  const [notifStatus, setNotifStatus] = useState<string>('not requested')
  const [lastNotif, setLastNotif] = useState<string>('none')
  const [authSupported, setAuthSupported] = useState<string>('unknown')
  const [authEnrolled, setAuthEnrolled] = useState<string>('unknown')
  const [authTypes, setAuthTypes] = useState<string>('n/a')
  const [authResult, setAuthResult] = useState<string>('not tested')
  const [orientation, setOrientation] = useState<string>('unknown')
  const [locked, setLocked] = useState<string>('unlocked')
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

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    })

    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      const title = notification.request.content.title ?? 'No title'
      const body = notification.request.content.body ?? ''
      setLastNotif(`${title}${body ? `: ${body}` : ''}`)
    })

    return () => {
      subscription.remove()
    }
  }, [])

  const requestNotifPermission = async () => {
    const permissions = await Notifications.requestPermissionsAsync()
    const status = (permissions as { status?: string }).status ?? 'unknown'
    setNotifStatus(status)
  }

  const scheduleLocalNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Hello from Expo Notifications',
        body: 'This is a local notification demo.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
        repeats: false,
      },
    })
    setLastNotif('scheduled (2s)')
  }

  const formatAuthTypes = (types: number[]) => {
    const map: Record<number, string> = {
      [LocalAuthentication.AuthenticationType.FINGERPRINT]: 'fingerprint',
      [LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION]: 'face',
      [LocalAuthentication.AuthenticationType.IRIS]: 'iris',
    }
    const names = types.map((t) => map[t] ?? `type-${t}`)
    return names.length ? names.join(', ') : 'none'
  }

  const checkAuthSupport = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync()
    const enrolled = await LocalAuthentication.isEnrolledAsync()
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync()
    setAuthSupported(hasHardware ? 'available' : 'unavailable')
    setAuthEnrolled(enrolled ? 'enrolled' : 'not enrolled')
    setAuthTypes(formatAuthTypes(types))
  }

  const authenticate = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate',
      fallbackLabel: 'Enter passcode',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    })
    if (result.success) {
      setAuthResult('success')
    } else if (result.error) {
      setAuthResult(`error: ${result.error}`)
    } else {
      setAuthResult('cancelled')
    }
  }

  const updateOrientation = async () => {
    const current = await ScreenOrientation.getOrientationAsync()
    setOrientation(ScreenOrientation.Orientation[current] ?? String(current))
  }

  const lockPortrait = async () => {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
    setLocked('portrait')
    await updateOrientation()
  }

  const lockLandscape = async () => {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)
    setLocked('landscape')
    await updateOrientation()
  }

  const unlockOrientation = async () => {
    await ScreenOrientation.unlockAsync()
    setLocked('unlocked')
    await updateOrientation()
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: 'transparent' }}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingVertical: 20,
        gap: 16,
        alignItems: 'center',
        paddingBottom: 120,
      }}
    >
      <View items="center" justify="center" gap="$4" w="100%">
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
        <Separator />
        <YStack gap="$3" w="100%" maw={360}>
          <Text fontSize={18} color="$color">
            Notifications demo
          </Text>
          <Button onPress={requestNotifPermission}>Request permission</Button>
          <Button onPress={scheduleLocalNotification} variant="outlined">
            Schedule local notification (2s)
          </Button>
          <Text color="$gray11">Permission: {notifStatus}</Text>
          <Text color="$gray11">Last notification: {lastNotif}</Text>
        </YStack>
        <Separator />
        <YStack gap="$3" w="100%" maw={360}>
          <Text fontSize={18} color="$color">
            Local authentication demo
          </Text>
          <Button onPress={checkAuthSupport}>Check availability</Button>
          <Button onPress={authenticate} variant="outlined">
            Authenticate
          </Button>
          <Text color="$gray11">Hardware: {authSupported}</Text>
          <Text color="$gray11">Enrollment: {authEnrolled}</Text>
          <Text color="$gray11">Types: {authTypes}</Text>
          <Text color="$gray11">Last result: {authResult}</Text>
        </YStack>
        <Separator />
        <YStack gap="$3" w="100%" maw={360}>
          <Text fontSize={18} color="$color">
            Screen orientation demo
          </Text>
          <Button onPress={updateOrientation}>Get orientation</Button>
          <Button onPress={lockPortrait}>Lock portrait</Button>
          <Button onPress={lockLandscape}>Lock landscape</Button>
          <Button onPress={unlockOrientation} variant="outlined">
            Unlock orientation
          </Button>
          <Text color="$gray11">Current: {orientation}</Text>
          <Text color="$gray11">Lock: {locked}</Text>
        </YStack>
      </View>
    </ScrollView>
  )
}
