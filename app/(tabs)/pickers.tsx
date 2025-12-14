import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useState } from 'react'
import { ScrollView } from 'react-native'
import { Button, Paragraph, Separator, SizableText, Text, YStack } from 'tamagui'

// These native modules require a dev client build (npx expo run:ios/android)
// They are NOT available in Expo Go:
// - @react-native-picker/picker
// - @react-native-masked-view/masked-view
// - @react-native-community/datetimepicker
// - react-native-purchases
// - react-native-purchases-ui

export default function PickersTab() {
  // RxDB state (works in Expo Go - pure JS)
  const [rxdbStatus, setRxdbStatus] = useState('not initialized')
  const [rxdbItems, setRxdbItems] = useState<string[]>([])

  // Simple RxDB demo (pure JS, works in Expo Go)
  const initRxDB = async () => {
    try {
      setRxdbStatus('initializing…')
      const { createRxDatabase } = await import('rxdb')
      const { getRxStorageMemory } = await import('rxdb/plugins/storage-memory')

      const db = await createRxDatabase({
        name: `demodb${Date.now()}`,
        storage: getRxStorageMemory(),
      })

      await db.addCollections({
        items: {
          schema: {
            version: 0,
            primaryKey: 'id',
            type: 'object',
            properties: {
              id: { type: 'string', maxLength: 100 },
              name: { type: 'string' },
            },
            required: ['id', 'name'],
          },
        },
      })

      await db.items.bulkInsert([
        { id: '1', name: 'First item' },
        { id: '2', name: 'Second item' },
        { id: '3', name: 'Third item' },
      ])

      const allItems = await db.items.find().exec()
      setRxdbItems(allItems.map((doc: { name: string }) => doc.name))
      setRxdbStatus('initialized (in-memory)')
    } catch (e) {
      setRxdbStatus(`error: ${String(e)}`)
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: 'transparent' }}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingVertical: 20,
        gap: 18,
        alignItems: 'center',
        paddingBottom: 120,
      }}
    >
      <YStack ai="center" gap="$2">
        <Ionicons name="options-outline" size={28} color="#EC4899" />
        <SizableText size="$6" color="$color">
          Pickers & Data
        </SizableText>
        <Paragraph ta="center" color="$gray11">
          Picker, MaskedView, DateTimePicker, RxDB, Purchases
        </Paragraph>
      </YStack>

      {/* Native Modules Info */}
      <YStack gap="$2" w="100%" maw={420}>
        <Text fontSize={18} color="$color">
          Native Modules (dev client only)
        </Text>
        <YStack bg="$orange3" p="$3" br="$3" gap="$2">
          <Text color="$orange11" fontWeight="600">
            ⚠️ These require a development build:
          </Text>
          <Text color="$orange11" fontSize={13}>
            • @react-native-picker/picker
          </Text>
          <Text color="$orange11" fontSize={13}>
            • @react-native-community/datetimepicker
          </Text>
          <Text color="$orange11" fontSize={13}>
            • @react-native-masked-view/masked-view
          </Text>
          <Text color="$orange11" fontSize={13}>
            • react-native-purchases
          </Text>
        </YStack>
        <YStack bg="$gray3" p="$3" br="$3">
          <Text color="$gray11" fontSize={12}>
            To use these modules:
          </Text>
          <Text color="$gray11" fontSize={12} mt="$1">
            1. npx expo prebuild
          </Text>
          <Text color="$gray11" fontSize={12}>
            2. npx expo run:ios (or run:android)
          </Text>
        </YStack>
      </YStack>

      <Separator />

      {/* Gradient Demo (works in Expo Go) */}
      <YStack gap="$2" w="100%" maw={420}>
        <Text fontSize={18} color="$color">
          LinearGradient (works in Expo Go)
        </Text>
        <LinearGradient
          colors={['#EC4899', '#8B5CF6', '#3B82F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            width: '100%',
            height: 60,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text fontSize={24} fontWeight="900" color="white">
            GRADIENT TEXT
          </Text>
        </LinearGradient>
        <Paragraph color="$gray11" ta="center">
          expo-linear-gradient works everywhere
        </Paragraph>
      </YStack>

      <Separator />

      {/* RxDB Demo (pure JS, works in Expo Go) */}
      <YStack gap="$2" w="100%" maw={420}>
        <Text fontSize={18} color="$color">
          RxDB (works in Expo Go)
        </Text>
        <Button onPress={initRxDB}>Initialize RxDB</Button>
        <Paragraph color="$gray11">Status: {rxdbStatus}</Paragraph>
        {rxdbItems.length > 0 && (
          <YStack bg="$gray3" p="$2" br="$3" gap="$1">
            {rxdbItems.map((item, i) => (
              <Text key={i} color="$color" fontSize={14}>
                • {item}
              </Text>
            ))}
          </YStack>
        )}
        <Paragraph color="$gray10" fontSize={12}>
          RxDB with memory storage is pure JS and works in Expo Go.
        </Paragraph>
      </YStack>

      <Separator />

      {/* RevenueCat Info */}
      <YStack gap="$2" w="100%" maw={420}>
        <Text fontSize={18} color="$color">
          RevenueCat (dev client only)
        </Text>
        <YStack bg="$gray3" p="$3" br="$3">
          <Paragraph color="$gray10" fontSize={12}>
            react-native-purchases requires native modules.
          </Paragraph>
          <Paragraph color="$gray10" fontSize={12} mt="$2">
            Setup steps:
          </Paragraph>
          <Paragraph color="$gray10" fontSize={12} mt="$1">
            1. Create account at revenuecat.com
          </Paragraph>
          <Paragraph color="$gray10" fontSize={12}>
            2. Get API key from dashboard
          </Paragraph>
          <Paragraph color="$gray10" fontSize={12}>
            3. Build with npx expo run:ios
          </Paragraph>
          <Paragraph color="$gray10" fontSize={12}>
            4. Call Purchases.configure()
          </Paragraph>
        </YStack>
      </YStack>

      <Separator />

      {/* TanStack DB Info */}
      <YStack gap="$2" w="100%" maw={420}>
        <Text fontSize={18} color="$color">
          TanStack DB
        </Text>
        <YStack bg="$blue3" p="$3" br="$3">
          <Text color="$blue11" fontSize={13}>
            TanStack DB is not yet released as a standalone package. Check tanstack.com
            for updates.
          </Text>
        </YStack>
      </YStack>
    </ScrollView>
  )
}
