import { Ionicons } from '@expo/vector-icons'
import { H2, SizableText, YStack } from 'tamagui'
import StorybookUIRoot from '../../storybook'

export default function TabFourScreen() {
  return (
    <YStack flex={1} gap="$4" px="$6" pt="$5" bg="$background">
      <YStack gap="$2" ai="center">
        <Ionicons name="construct-outline" size={28} color="#5EEAD4" />
        <H2>Storybook</H2>
      </YStack>

      <YStack gap="$3" ai="center" w="100%" flex={1}>
        <SizableText size="$4" color="$color">
          Storybook (embedded)
        </SizableText>
        <YStack flex={1} w="100%">
          <StorybookUIRoot />
        </YStack>
      </YStack>
    </YStack>
  )
}
