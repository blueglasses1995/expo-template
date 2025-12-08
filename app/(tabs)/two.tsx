import { useMemo } from 'react'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { Text, View, YStack } from 'tamagui'

export default function TabTwoScreen() {
  const presses = useSharedValue(0)

  const tap = useMemo(
    () =>
      Gesture.Tap().onEnd(() => {
        presses.value += 1
      }),
    [presses],
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
    </View>
  )
}
