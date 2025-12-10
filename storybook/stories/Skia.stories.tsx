import type { Meta, StoryObj } from '@storybook/react-native'
import { Canvas, Circle } from '@shopify/react-native-skia'
import { YStack } from 'tamagui'

const meta: Meta = {
  title: 'Skia/Circle',
}

export default meta

type Story = StoryObj

export const CircleDemo: Story = {
  render: () => (
    <YStack bg="$background" alignItems="center" justifyContent="center" padding="$4">
      <Canvas style={{ width: 220, height: 220, borderRadius: 12, backgroundColor: '#0f172a' }}>
        <Circle cx={110} cy={110} r={70} color="rgba(94, 234, 212, 0.9)" />
      </Canvas>
    </YStack>
  ),
}

