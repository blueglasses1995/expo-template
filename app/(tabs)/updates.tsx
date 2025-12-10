import { Ionicons } from '@expo/vector-icons'
import * as Updates from 'expo-updates'
import { useState } from 'react'
import { Anchor, H2, Paragraph, SizableText, YStack } from 'tamagui'

export default function UpdatesTab() {
  const [updateInfo, setUpdateInfo] = useState<string>('not checked')

  return (
    <YStack flex={1} gap="$4" px="$6" pt="$5" bg="$background">
      <YStack gap="$2" ai="center">
        <Ionicons name="cloud-download-outline" size={28} color="#5EEAD4" />
        <H2>Expo Updates</H2>
      </YStack>

      <YStack gap="$2" ai="center">
        <SizableText size="$4" color="$color">
          Channel / Runtime
        </SizableText>
        <Paragraph color="$gray11" ta="center">
          channel: {Updates.channel || 'n/a'}
        </Paragraph>
        <Paragraph color="$gray11" ta="center">
          runtime: {Updates.runtimeVersion || 'n/a'}
        </Paragraph>
        <Paragraph color="$gray11" ta="center">
          status: {updateInfo}
        </Paragraph>
        <Anchor
          href="#"
          color="$blue10"
          onPress={async () => {
            try {
              const update = await Updates.checkForUpdateAsync()
              setUpdateInfo(
                update.isAvailable ? 'update available (not downloaded)' : 'up to date'
              )
            } catch (e) {
              setUpdateInfo(`error: ${String(e)}`)
            }
            return false
          }}
        >
          check for updates
        </Anchor>
      </YStack>
    </YStack>
  )
}
