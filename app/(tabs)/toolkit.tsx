import { Ionicons } from '@expo/vector-icons'
import * as AppleAuthentication from 'expo-apple-authentication'
import { Asset } from 'expo-asset'
import * as AuthSession from 'expo-auth-session'
import { BlurView } from 'expo-blur'
import * as Brightness from 'expo-brightness'
import * as Calendar from 'expo-calendar'
import * as Crypto from 'expo-crypto'
import { Image } from 'expo-image'
import { useEffect, useMemo, useState } from 'react'
import { Platform, ScrollView, useColorScheme } from 'react-native'
import { type DateData, Calendar as RNCalendar } from 'react-native-calendars'
import {
  Button,
  Input,
  Paragraph,
  Separator,
  SizableText,
  Text,
  XStack,
  YStack,
} from 'tamagui'

const blurImage =
  'https://images.unsplash.com/photo-1454023492550-5696f8ff10e1?w=800&auto=format&fit=crop'

export default function ToolkitTab() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const [calendarStatus, setCalendarStatus] = useState<string>('not requested')
  const [calendarNames, setCalendarNames] = useState<string[]>([])
  const [calendarEvents, setCalendarEvents] = useState<Calendar.Event[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [assetStatus, setAssetStatus] = useState<string>('not loaded')
  const [assetLoading, setAssetLoading] = useState(false)
  const [hashInput, setHashInput] = useState<string>('Hello Expo')
  const [digest, setDigest] = useState<string>('not computed')
  const [appleResult, setAppleResult] = useState<string>('not started')
  const [appleAvailable, setAppleAvailable] = useState<boolean>(false)
  const [brightness, setBrightness] = useState<number | null>(null)
  const [authRedirect, setAuthRedirect] = useState<string>('')

  useEffect(() => {
    try {
      AuthSession.maybeCompleteAuthSession()
    } catch {
      // ignore – may fail in Expo Go or when web browser module isn't ready
    }
    try {
      setAuthRedirect(AuthSession.makeRedirectUri({ path: 'auth-callback' }))
    } catch {
      setAuthRedirect('(unavailable)')
    }
  }, [])

  useEffect(() => {
    AppleAuthentication.isAvailableAsync()
      .then((available) => setAppleAvailable(available))
      .catch(() => setAppleAvailable(false))
  }, [])

  const proxyRedirect = useMemo(() => {
    try {
      return AuthSession.makeRedirectUri({ useProxy: true, path: 'auth-callback' })
    } catch {
      return '(unavailable)'
    }
  }, [])

  // Build marked dates from calendar events
  const markedDates = useMemo(() => {
    const marks: Record<
      string,
      { marked?: boolean; dotColor?: string; selected?: boolean; selectedColor?: string }
    > = {}
    for (const event of calendarEvents) {
      const dateStr = event.startDate.split('T')[0]
      if (dateStr) {
        marks[dateStr] = { marked: true, dotColor: '#5EEAD4' }
      }
    }
    // Add selected date highlighting
    if (selectedDate) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: '#5EEAD4',
      }
    }
    return marks
  }, [calendarEvents, selectedDate])

  // Events for selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return []
    return calendarEvents.filter((e) => e.startDate.startsWith(selectedDate))
  }, [calendarEvents, selectedDate])

  const requestCalendarInfo = async () => {
    try {
      setCalendarStatus('requesting…')
      const { status } = await Calendar.requestCalendarPermissionsAsync()
      setCalendarStatus(status)
      if (status === 'granted') {
        const cals = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT)
        setCalendarNames(cals.slice(0, 4).map((c) => c.title || 'untitled'))

        // Fetch events for next 60 days
        const now = new Date()
        const endDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
        const events = await Calendar.getEventsAsync(
          cals.map((c) => c.id),
          now,
          endDate
        )
        setCalendarEvents(events)
      } else {
        setCalendarNames([])
        setCalendarEvents([])
      }
    } catch (error) {
      setCalendarStatus(`error: ${String(error)}`)
      setCalendarNames([])
      setCalendarEvents([])
    }
  }

  const loadAsset = async () => {
    try {
      setAssetLoading(true)
      setAssetStatus('downloading…')
      const asset = Asset.fromURI(blurImage)
      await asset.downloadAsync()
      const size = asset.filesize
        ? `${Math.round(asset.filesize / 1024)}kb`
        : 'unknown size'
      setAssetStatus(`${asset.name ?? 'image'} (${asset.width}x${asset.height}, ${size})`)
    } catch (error) {
      setAssetStatus(`error: ${String(error)}`)
    } finally {
      setAssetLoading(false)
    }
  }

  const runCrypto = async () => {
    const text = hashInput.trim()
    const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, text)
    setDigest(hash)
  }

  const handleAppleLogin = async () => {
    if (!appleAvailable) {
      setAppleResult('Apple Sign In not available')
      return
    }
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
      })
      setAppleResult(`success (user: ${credential.user})`)
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error) {
        const err = error as { code?: string }
        if (err.code === 'ERR_REQUEST_CANCELED') {
          setAppleResult('cancelled')
          return
        }
      }
      setAppleResult(`error: ${String(error)}`)
    }
  }

  const readBrightness = async () => {
    const permission = await Brightness.requestPermissionsAsync?.()
    if (permission && permission.status !== 'granted') {
      setBrightness(null)
      return
    }
    const current = await Brightness.getBrightnessAsync()
    setBrightness(current)
  }

  const setDim = async () => {
    await Brightness.setBrightnessAsync(0.35)
    setBrightness(0.35)
  }

  const setBright = async () => {
    await Brightness.setBrightnessAsync(0.8)
    setBrightness(0.8)
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#000' }}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingVertical: 20,
        gap: 18,
        alignItems: 'center',
        paddingBottom: 120,
      }}
    >
      <YStack ai="center" gap="$2">
        <Ionicons name="construct-outline" size={28} color="#5EEAD4" />
        <SizableText size="$6" color="$color">
          Toolkit (new Expo APIs)
        </SizableText>
        <Paragraph ta="center" color="$gray11">
          Calendar, Asset, Auth Session, Crypto, Blur, Brightness, Apple Sign In
        </Paragraph>
      </YStack>

      <YStack gap="$2" w="100%" maw={420}>
        <XStack jc="space-between" ai="center">
          <Text fontSize={18} color="$color">
            Calendar (expo-calendar)
          </Text>
          <Button
            size="$2.5"
            onPress={requestCalendarInfo}
            disabled={calendarStatus === 'requesting…'}
          >
            Request
          </Button>
        </XStack>
        <Text color="$gray11">Permission: {calendarStatus}</Text>
        <Text color="$gray11">
          Calendars: {calendarNames.length ? calendarNames.join(', ') : 'none'}
        </Text>
      </YStack>

      <Separator />

      <YStack gap="$2" w="100%" maw={420}>
        <Text fontSize={18} color="$color">
          Calendar UI (react-native-calendars)
        </Text>
        <YStack br="$4" overflow="hidden">
          <RNCalendar
            onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
              calendarBackground: isDark ? '#1a1a1a' : '#ffffff',
              textSectionTitleColor: isDark ? '#888' : '#666',
              selectedDayBackgroundColor: '#5EEAD4',
              selectedDayTextColor: '#000',
              todayTextColor: '#5EEAD4',
              dayTextColor: isDark ? '#fff' : '#2d4150',
              textDisabledColor: isDark ? '#444' : '#d9e1e8',
              arrowColor: '#5EEAD4',
              monthTextColor: isDark ? '#fff' : '#2d4150',
            }}
          />
        </YStack>
        <Paragraph color="$gray11">
          Selected: {selectedDate || 'none'} ({selectedDateEvents.length} events)
        </Paragraph>
        {selectedDateEvents.length > 0 && (
          <YStack gap="$1" bg="$gray3" p="$2" br="$3">
            {selectedDateEvents.slice(0, 5).map((event) => (
              <YStack key={event.id} gap="$0.5">
                <Text fontSize={14} color="$color" fontWeight="600">
                  {event.title || '(no title)'}
                </Text>
                <Text fontSize={12} color="$gray11">
                  {new Date(event.startDate).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {event.endDate &&
                    ` – ${new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                </Text>
              </YStack>
            ))}
            {selectedDateEvents.length > 5 && (
              <Text fontSize={12} color="$gray10">
                +{selectedDateEvents.length - 5} more
              </Text>
            )}
          </YStack>
        )}
        <Paragraph color="$gray10" fontSize="$2">
          Total events loaded: {calendarEvents.length}
        </Paragraph>
      </YStack>

      <Separator />

      <YStack gap="$2" w="100%" maw={420}>
        <XStack jc="space-between" ai="center">
          <Text fontSize={18} color="$color">
            Asset + Blur
          </Text>
          <Button size="$2.5" onPress={loadAsset} disabled={assetLoading}>
            {assetLoading ? 'Loading…' : 'Load'}
          </Button>
        </XStack>
        <YStack gap="$2" ai="center">
          <Paragraph color="$gray11">Status: {assetStatus}</Paragraph>
          <YStack pos="relative" w="100%" h={180} overflow="hidden" br="$4">
            <Image
              source={{ uri: blurImage }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
            <BlurView
              intensity={30}
              tint="dark"
              style={{ position: 'absolute', inset: 0 }}
            />
            <YStack pos="absolute" inset={0} ai="center" jc="center" gap="$2">
              <Text color="$color">expo-blur overlay</Text>
            </YStack>
          </YStack>
        </YStack>
      </YStack>

      <Separator />

      <YStack gap="$2" w="100%" maw={420}>
        <Text fontSize={18} color="$color">
          Crypto (SHA-256)
        </Text>
        <Input value={hashInput} onChangeText={setHashInput} placeholder="Text to hash" />
        <Button onPress={runCrypto}>Compute SHA-256</Button>
        <Paragraph color="$gray11" selectable>
          Hash: {digest}
        </Paragraph>
        <Paragraph color="$gray10" fontSize="$2">
          expo-blob is excluded (requires custom dev client / prebuild)
        </Paragraph>
      </YStack>

      <Separator />

      <YStack gap="$2" w="100%" maw={420}>
        <Text fontSize={18} color="$color">
          Auth Session
        </Text>
        <Paragraph color="$gray11" selectable>
          Redirect: {authRedirect}
        </Paragraph>
        <Paragraph color="$gray11" selectable>
          Proxy redirect: {proxyRedirect}
        </Paragraph>
        <Button
          size="$2.5"
          onPress={() => {
            try {
              setAuthRedirect(
                AuthSession.makeRedirectUri({
                  path: 'auth-callback',
                  useProxy: Platform.OS === 'web',
                })
              )
            } catch {
              setAuthRedirect('(unavailable)')
            }
          }}
        >
          Refresh redirect
        </Button>
      </YStack>

      <Separator />

      <YStack gap="$2" w="100%" maw={420}>
        <Text fontSize={18} color="$color">
          Apple Sign In
        </Text>
        <Paragraph color="$gray11">
          Available: {appleAvailable ? 'yes' : 'no (only iOS physical devices)'}
        </Paragraph>
        {appleAvailable ? (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={8}
            style={{ width: '100%', height: 44 }}
            onPress={handleAppleLogin}
          />
        ) : (
          <Button disabled>Apple Sign In unavailable</Button>
        )}
        <Paragraph color="$gray11">Result: {appleResult}</Paragraph>
      </YStack>

      <Separator />

      <YStack gap="$2" w="100%" maw={420}>
        <Text fontSize={18} color="$color">
          Brightness
        </Text>
        <XStack gap="$2">
          <Button flex={1} onPress={readBrightness}>
            Read
          </Button>
          <Button flex={1} onPress={setDim} variant="outlined">
            Dim
          </Button>
          <Button flex={1} onPress={setBright} variant="outlined">
            Bright
          </Button>
        </XStack>
        <Paragraph color="$gray11">
          Current: {brightness !== null ? `${Math.round(brightness * 100)}%` : 'unknown'}
        </Paragraph>
      </YStack>
    </ScrollView>
  )
}
