import { ToastProvider, ToastViewport } from '@tamagui/toast'
import { QueryClient } from '@tanstack/query-core'
import { QueryClientProvider } from '@tanstack/react-query'
import { TamaguiProvider, type TamaguiProviderProps } from 'tamagui'
import { config } from '../tamagui.config'
import { CurrentToast } from './CurrentToast'

const queryClient = new QueryClient()

export function Provider({ children, ...rest }: Omit<TamaguiProviderProps, 'config'>) {
  // 常にダークテーマを使用（全画面黒背景）
  return (
    <TamaguiProvider config={config} defaultTheme="dark" {...rest}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider
          swipeDirection="horizontal"
          duration={6000}
          native={
            [
              // uncomment the next line to do native toasts on mobile. NOTE: it'll require you making a dev build and won't work with Expo Go
              // 'mobile'
            ]
          }
        >
          {children}
          <CurrentToast />
          <ToastViewport top="$8" left={0} right={0} />
        </ToastProvider>
      </QueryClientProvider>
    </TamaguiProvider>
  )
}
