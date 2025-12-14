import {
  appState$,
  dimensions$,
  keyboard$,
  orientation$,
  useObservable,
  useObservableCallback,
  useSubject,
} from 'lib/rxjs'
import { useEffect, useState } from 'react'
import { ScrollView } from 'react-native'
import { interval } from 'rxjs'
import { debounceTime, map } from 'rxjs/operators'
import { Button, H3, H4, Input, Separator, Text, XStack, YStack } from 'tamagui'

/**
 * RxJS デモ画面
 */
export default function RxJSScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000' }}>
      <YStack padding="$4" gap="$4">
        <H3>🔄 RxJS デモ</H3>

        <CounterDemo />
        <Separator />
        <AppStateDemo />
        <Separator />
        <DimensionsDemo />
        <Separator />
        <KeyboardDemo />
        <Separator />
        <DebounceInputDemo />
        <Separator />
        <SubjectDemo />
      </YStack>
    </ScrollView>
  )
}

// --------------------------------------------------
// カウンターデモ
// --------------------------------------------------

function CounterDemo() {
  const [count, setCount] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    if (!isRunning) return

    const sub = interval(1000)
      .pipe(map((n) => n + 1))
      .subscribe(setCount)

    return () => sub.unsubscribe()
  }, [isRunning])

  return (
    <YStack gap="$3">
      <H4>⏱️ インターバルカウンター</H4>
      <YStack backgroundColor="$gray2" padding="$4" borderRadius="$4" alignItems="center">
        <Text fontSize="$8" fontWeight="bold">
          {count}
        </Text>
        <Text color="$gray11" fontSize="$2">
          interval(1000) で1秒ごとに更新
        </Text>
      </YStack>
      <XStack gap="$2">
        <Button
          flex={1}
          theme={isRunning ? 'red' : 'green'}
          onPress={() => setIsRunning(!isRunning)}
        >
          {isRunning ? '停止' : '開始'}
        </Button>
        <Button
          flex={1}
          variant="outlined"
          onPress={() => {
            setCount(0)
            setIsRunning(false)
          }}
        >
          リセット
        </Button>
      </XStack>
    </YStack>
  )
}

// --------------------------------------------------
// アプリ状態デモ
// --------------------------------------------------

function AppStateDemo() {
  const appState = useObservable(appState$, 'unknown')

  return (
    <YStack gap="$3">
      <H4>📱 アプリ状態監視</H4>
      <YStack backgroundColor="$gray2" padding="$4" borderRadius="$4">
        <XStack justifyContent="space-between">
          <Text color="$gray11">現在の状態:</Text>
          <Text
            color={
              appState === 'active'
                ? '$green10'
                : appState === 'background'
                  ? '$yellow10'
                  : '$gray11'
            }
            fontWeight="bold"
          >
            {appState}
          </Text>
        </XStack>
        <Text color="$gray11" fontSize="$2" marginTop="$2">
          アプリをバックグラウンドに移動すると変わります
        </Text>
      </YStack>
    </YStack>
  )
}

// --------------------------------------------------
// 画面サイズデモ
// --------------------------------------------------

function DimensionsDemo() {
  const dimensions = useObservable(dimensions$, {
    width: 0,
    height: 0,
    scale: 1,
    fontScale: 1,
  })
  const orientation = useObservable(orientation$, 'portrait')

  return (
    <YStack gap="$3">
      <H4>📐 画面サイズ監視</H4>
      <YStack backgroundColor="$gray2" padding="$4" borderRadius="$4" gap="$2">
        <XStack justifyContent="space-between">
          <Text color="$gray11">サイズ:</Text>
          <Text>
            {Math.round(dimensions.width)} x {Math.round(dimensions.height)}
          </Text>
        </XStack>
        <XStack justifyContent="space-between">
          <Text color="$gray11">向き:</Text>
          <Text>{orientation === 'portrait' ? '縦向き' : '横向き'}</Text>
        </XStack>
        <XStack justifyContent="space-between">
          <Text color="$gray11">スケール:</Text>
          <Text>{dimensions.scale}x</Text>
        </XStack>
      </YStack>
    </YStack>
  )
}

// --------------------------------------------------
// キーボードデモ
// --------------------------------------------------

function KeyboardDemo() {
  const keyboard = useObservable(keyboard$, { visible: false, height: 0 })

  return (
    <YStack gap="$3">
      <H4>⌨️ キーボード監視</H4>
      <YStack backgroundColor="$gray2" padding="$4" borderRadius="$4" gap="$2">
        <XStack justifyContent="space-between">
          <Text color="$gray11">表示:</Text>
          <Text color={keyboard.visible ? '$green10' : '$gray11'}>
            {keyboard.visible ? 'はい' : 'いいえ'}
          </Text>
        </XStack>
        <XStack justifyContent="space-between">
          <Text color="$gray11">高さ:</Text>
          <Text>{keyboard.height}px</Text>
        </XStack>
        <Input placeholder="タップしてキーボードを表示" marginTop="$2" />
      </YStack>
    </YStack>
  )
}

// --------------------------------------------------
// デバウンス入力デモ
// --------------------------------------------------

function DebounceInputDemo() {
  const [onInput, debouncedValue] = useObservableCallback<string, string>((input$) =>
    input$.pipe(debounceTime(500))
  )
  const [inputValue, setInputValue] = useState('')

  const handleChange = (text: string) => {
    setInputValue(text)
    onInput(text)
  }

  return (
    <YStack gap="$3">
      <H4>🔍 デバウンス入力</H4>
      <YStack backgroundColor="$gray2" padding="$4" borderRadius="$4" gap="$3">
        <Input
          placeholder="入力してください..."
          value={inputValue}
          onChangeText={handleChange}
        />
        <YStack gap="$1">
          <XStack justifyContent="space-between">
            <Text color="$gray11">入力値:</Text>
            <Text>{inputValue || '(空)'}</Text>
          </XStack>
          <XStack justifyContent="space-between">
            <Text color="$gray11">デバウンス後 (500ms):</Text>
            <Text color="$blue10">{debouncedValue || '(空)'}</Text>
          </XStack>
        </YStack>
        <Text color="$gray11" fontSize="$2">
          入力後500ms経過すると「デバウンス後」が更新されます
        </Text>
      </YStack>
    </YStack>
  )
}

// --------------------------------------------------
// Subject デモ
// --------------------------------------------------

function SubjectDemo() {
  const { value, next } = useSubject(0)

  return (
    <YStack gap="$3">
      <H4>📡 BehaviorSubject</H4>
      <YStack backgroundColor="$gray2" padding="$4" borderRadius="$4" gap="$3">
        <Text textAlign="center" fontSize="$6" fontWeight="bold">
          {value}
        </Text>
        <XStack gap="$2">
          <Button flex={1} onPress={() => next(value - 1)}>
            - 1
          </Button>
          <Button flex={1} onPress={() => next(value + 1)}>
            + 1
          </Button>
        </XStack>
        <Button variant="outlined" onPress={() => next(0)}>
          リセット
        </Button>
        <Text color="$gray11" fontSize="$2" textAlign="center">
          useSubject で値の発行と購読を管理
        </Text>
      </YStack>
    </YStack>
  )
}
