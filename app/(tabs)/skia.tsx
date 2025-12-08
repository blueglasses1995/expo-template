import { Canvas, Circle } from '@shopify/react-native-skia'
import { useEffect, useMemo, useState } from 'react'
import { Button, Text, YStack } from 'tamagui'

export default function SkiaDemo() {
  const [pulse, setPulse] = useState(0)

  // animate with a simple JS interval to avoid extra animation APIs
  useEffect(() => {
    const id = setInterval(() => {
      setPulse((v) => (v >= 1 ? 0 : v + 0.05))
    }, 50)
    return () => clearInterval(id)
  }, [])

  const radius = useMemo(() => 60 + 30 * Math.sin(pulse * Math.PI), [pulse])
  const opacity = useMemo(() => 0.4 + 0.6 * pulse, [pulse])

  return (
    <YStack
      flex={1}
      bg="$background"
      alignItems="center"
      justifyContent="center"
      gap="$4"
      px="$4"
    >
      <Text fontSize={22} color="$color">
        Skia pulse (JS-driven)
      </Text>
      <Canvas
        style={{ width: 300, height: 300, borderRadius: 12, backgroundColor: '#0f172a' }}
      >
        <Circle cx={150} cy={150} r={radius} color={`rgba(94, 234, 212, ${opacity})`} />
      </Canvas>
      <Button onPress={() => setPulse(0)}>Reset</Button>
    </YStack>
  )
}
