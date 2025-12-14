import { Ionicons } from '@expo/vector-icons'
import * as Sharing from 'expo-sharing'
import * as SMS from 'expo-sms'
import * as Speech from 'expo-speech'
import * as SQLite from 'expo-sqlite'
import * as StoreReview from 'expo-store-review'
import { useEffect, useState } from 'react'
import { ScrollView } from 'react-native'
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

export default function UtilsTab() {
  // Speech
  const [speechText, setSpeechText] = useState('Hello from Expo Speech!')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voices, setVoices] = useState<Speech.Voice[]>([])

  // SMS
  const [smsAvailable, setSmsAvailable] = useState<boolean | null>(null)

  // Sharing
  const [sharingAvailable, setSharingAvailable] = useState<boolean | null>(null)

  // Store Review
  const [reviewAvailable, setReviewAvailable] = useState<boolean | null>(null)
  const [reviewStatus, setReviewStatus] = useState('not requested')

  // SQLite
  const [dbStatus, setDbStatus] = useState('not initialized')
  const [dbItems, setDbItems] = useState<{ id: number; value: string }[]>([])
  const [newItem, setNewItem] = useState('')

  // Task Manager
  const [taskStatus, setTaskStatus] = useState('not checked')

  useEffect(() => {
    // Check SMS availability
    SMS.isAvailableAsync()
      .then((available) => setSmsAvailable(available))
      .catch(() => setSmsAvailable(false))

    // Check Sharing availability
    Sharing.isAvailableAsync()
      .then((available) => setSharingAvailable(available))
      .catch(() => setSharingAvailable(false))

    // Check Store Review availability
    StoreReview.isAvailableAsync()
      .then((available) => setReviewAvailable(available))
      .catch(() => setReviewAvailable(false))

    // Get available voices
    Speech.getAvailableVoicesAsync()
      .then((v) => setVoices(v.slice(0, 5)))
      .catch(() => setVoices([]))

    // Check registered tasks
    import('expo-task-manager')
      .then((TaskManager) => TaskManager.getRegisteredTasksAsync())
      .then((tasks) => setTaskStatus(`${tasks.length} tasks registered`))
      .catch(() => setTaskStatus('unavailable (needs dev client)'))
  }, [])

  // Speech functions
  const speak = () => {
    setIsSpeaking(true)
    Speech.speak(speechText, {
      language: 'en-US',
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    })
  }

  const stopSpeech = () => {
    Speech.stop()
    setIsSpeaking(false)
  }

  // SMS function
  const sendSMS = async () => {
    if (!smsAvailable) return
    await SMS.sendSMSAsync([''], 'Hello from Expo SMS!')
  }

  // Store Review function
  const requestReview = async () => {
    try {
      if (await StoreReview.hasAction()) {
        await StoreReview.requestReview()
        setReviewStatus('requested')
      } else {
        setReviewStatus('no action available')
      }
    } catch (e) {
      setReviewStatus(`error: ${String(e)}`)
    }
  }

  // SQLite functions
  const initDB = async () => {
    try {
      setDbStatus('initializing…')
      const db = await SQLite.openDatabaseAsync('demo.db')
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          value TEXT NOT NULL
        );
      `)
      setDbStatus('initialized')
      await loadItems()
    } catch (e) {
      setDbStatus(`error: ${String(e)}`)
    }
  }

  const loadItems = async () => {
    try {
      const db = await SQLite.openDatabaseAsync('demo.db')
      const rows = await db.getAllAsync<{ id: number; value: string }>(
        'SELECT * FROM items ORDER BY id DESC LIMIT 10'
      )
      setDbItems(rows)
    } catch (e) {
      console.log('loadItems error:', e)
    }
  }

  const addItem = async () => {
    if (!newItem.trim()) return
    try {
      const db = await SQLite.openDatabaseAsync('demo.db')
      await db.runAsync('INSERT INTO items (value) VALUES (?)', newItem.trim())
      setNewItem('')
      await loadItems()
    } catch (e) {
      console.log('addItem error:', e)
    }
  }

  const clearItems = async () => {
    try {
      const db = await SQLite.openDatabaseAsync('demo.db')
      await db.runAsync('DELETE FROM items')
      setDbItems([])
    } catch (e) {
      console.log('clearItems error:', e)
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
        <Ionicons name="build-outline" size={28} color="#F97316" />
        <SizableText size="$6" color="$color">
          Utils & Storage
        </SizableText>
        <Paragraph ta="center" color="$gray11">
          Speech, SMS, Sharing, SQLite, StoreReview, TaskManager
        </Paragraph>
      </YStack>

      {/* Speech Demo */}
      <YStack gap="$2" w="100%" maw={420}>
        <Text fontSize={18} color="$color">
          Speech
        </Text>
        <Input
          value={speechText}
          onChangeText={setSpeechText}
          placeholder="Text to speak"
        />
        <XStack gap="$2">
          <Button flex={1} onPress={speak} disabled={isSpeaking}>
            {isSpeaking ? 'Speaking…' : 'Speak'}
          </Button>
          <Button flex={1} onPress={stopSpeech} variant="outlined" disabled={!isSpeaking}>
            Stop
          </Button>
        </XStack>
        <Paragraph color="$gray11" fontSize={12}>
          Voices: {voices.length > 0 ? voices.map((v) => v.name).join(', ') : 'loading…'}
        </Paragraph>
      </YStack>

      <Separator />

      {/* SMS Demo */}
      <YStack gap="$2" w="100%" maw={420}>
        <Text fontSize={18} color="$color">
          SMS
        </Text>
        <Paragraph color="$gray11">
          Available: {smsAvailable === null ? 'checking…' : smsAvailable ? 'yes' : 'no'}
        </Paragraph>
        <Button onPress={sendSMS} disabled={!smsAvailable}>
          Compose SMS
        </Button>
      </YStack>

      <Separator />

      {/* Sharing Demo */}
      <YStack gap="$2" w="100%" maw={420}>
        <Text fontSize={18} color="$color">
          Sharing
        </Text>
        <Paragraph color="$gray11">
          Available:{' '}
          {sharingAvailable === null ? 'checking…' : sharingAvailable ? 'yes' : 'no'}
        </Paragraph>
        <Paragraph color="$gray10" fontSize={12}>
          Use Sharing.shareAsync(fileUri) to share files
        </Paragraph>
      </YStack>

      <Separator />

      {/* Store Review Demo */}
      <YStack gap="$2" w="100%" maw={420}>
        <Text fontSize={18} color="$color">
          Store Review
        </Text>
        <Paragraph color="$gray11">
          Available:{' '}
          {reviewAvailable === null ? 'checking…' : reviewAvailable ? 'yes' : 'no'}
        </Paragraph>
        <Button onPress={requestReview} disabled={!reviewAvailable}>
          Request Review
        </Button>
        <Paragraph color="$gray11">Status: {reviewStatus}</Paragraph>
      </YStack>

      <Separator />

      {/* SQLite Demo */}
      <YStack gap="$2" w="100%" maw={420}>
        <Text fontSize={18} color="$color">
          SQLite
        </Text>
        <XStack gap="$2">
          <Button flex={1} onPress={initDB}>
            Init DB
          </Button>
          <Button flex={1} onPress={clearItems} variant="outlined">
            Clear
          </Button>
        </XStack>
        <Paragraph color="$gray11">Status: {dbStatus}</Paragraph>
        <XStack gap="$2">
          <Input
            flex={1}
            value={newItem}
            onChangeText={setNewItem}
            placeholder="New item"
          />
          <Button onPress={addItem} disabled={dbStatus !== 'initialized'}>
            Add
          </Button>
        </XStack>
        {dbItems.length > 0 && (
          <YStack bg="$gray3" p="$2" br="$3" gap="$1">
            {dbItems.map((item) => (
              <Text key={item.id} color="$color" fontSize={14}>
                #{item.id}: {item.value}
              </Text>
            ))}
          </YStack>
        )}
      </YStack>

      <Separator />

      {/* Task Manager Demo */}
      <YStack gap="$2" w="100%" maw={420}>
        <Text fontSize={18} color="$color">
          Task Manager
        </Text>
        <Paragraph color="$gray11">Status: {taskStatus}</Paragraph>
        <Paragraph color="$gray10" fontSize={12}>
          Background tasks require native configuration (app.json plugins) and a dev
          client build.
        </Paragraph>
      </YStack>
    </ScrollView>
  )
}
