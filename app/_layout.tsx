// Crypto polyfill must be imported first (before any library that depends on crypto)
import 'lib/crypto-polyfill'
import 'react-native-gesture-handler'
import { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { enableScreens } from 'react-native-screens'
import '../tamagui-web.css'

import { Provider } from 'components/Provider'
import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useTheme } from 'tamagui'

enableScreens(true)

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router'

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [interLoaded, interError] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  // Datadog初期化（Expo Goでは自動的にスキップ）
  useEffect(() => {
    const initDatadog = async () => {
      try {
        const { initializeDatadog } = await import('lib/datadog')
        await initializeDatadog()
      } catch (error) {
        console.log('[Datadog] Init skipped:', error)
      }
    }
    initDatadog()
  }, [])

  useEffect(() => {
    if (interLoaded || interError) {
      // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
      SplashScreen.hideAsync()
    }
  }, [interLoaded, interError])

  if (!interLoaded && !interError) {
    return null
  }

  return (
    <Providers>
      <RootLayoutNav />
    </Providers>
  )
}

const Providers = ({ children }: { children: React.ReactNode }) => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <KeyboardProvider>
      <SafeAreaProvider>
        <Provider>{children}</Provider>
      </SafeAreaProvider>
    </KeyboardProvider>
  </GestureHandlerRootView>
)

function RootLayoutNav() {
  const theme = useTheme()
  return (
    <>
      {/* 常にダークテーマなのでステータスバーは白文字 */}
      <StatusBar style="light" />
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="auth"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="modal"
          options={{
            title: 'Tamagui + Expo',
            presentation: 'modal',
            animation: 'slide_from_right',
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            contentStyle: {
              backgroundColor: '#000',
            },
          }}
        />
      </Stack>
    </>
  )
}
