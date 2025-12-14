import { Ionicons } from '@expo/vector-icons'
import { createCollection } from '@tanstack/db'
import { eq } from 'drizzle-orm'
import { LinearGradient } from 'expo-linear-gradient'
import { useCallback, useRef, useState } from 'react'
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

// These native modules require a dev client build (npx expo run:ios/android)
// They are NOT available in Expo Go:
// - @react-native-picker/picker
// - @react-native-masked-view/masked-view
// - @react-native-community/datetimepicker
// - react-native-purchases
// - react-native-purchases-ui

// TanStack DB item type
interface TodoItem {
  id: string
  title: string
  completed: boolean
}

// Drizzle Todo type
interface DrizzleTodo {
  id: number
  title: string
  completed: boolean
  createdAt: string
}

export default function PickersTab() {
  // RxDB state (works in Expo Go - pure JS)
  const [rxdbStatus, setRxdbStatus] = useState('not initialized')
  const [rxdbItems, setRxdbItems] = useState<string[]>([])

  // TanStack DB state
  const [tanstackDbStatus, setTanstackDbStatus] = useState('not initialized')
  const [tanstackDbItems, setTanstackDbItems] = useState<TodoItem[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const collectionRef = useRef<any>(null)

  // Drizzle state
  const [drizzleStatus, setDrizzleStatus] = useState('not initialized')
  const [drizzleTodos, setDrizzleTodos] = useState<DrizzleTodo[]>([])
  const [drizzleInput, setDrizzleInput] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const drizzleDbRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const drizzleSchemaRef = useRef<any>(null)

  // Resend state
  const [emailTo, setEmailTo] = useState('')
  const [emailStatus, setEmailStatus] = useState('not sent')

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

  // TanStack DB demo - using localOnlyCollectionOptions (in-memory)
  const initTanStackDB = useCallback(async () => {
    try {
      setTanstackDbStatus('initializing…')

      // Import localOnlyCollectionOptions for in-memory storage
      const { localOnlyCollectionOptions } = await import('@tanstack/db')

      // Initial items
      const initialItems: TodoItem[] = [
        { id: '1', title: 'Learn TanStack DB', completed: false },
        { id: '2', title: 'Build awesome app', completed: false },
        { id: '3', title: 'Deploy to production', completed: true },
      ]

      // Create a simple in-memory collection with localOnlyCollectionOptions
      const todoCollection = createCollection<TodoItem, string>({
        ...localOnlyCollectionOptions<TodoItem, string>({
          getKey: (item) => item.id,
          initialData: initialItems,
        }),
        id: 'todos',
      })

      collectionRef.current = todoCollection

      // Get all items from the collection
      const items = Array.from(todoCollection.state.values()) as TodoItem[]
      setTanstackDbItems(items)
      setTanstackDbStatus('initialized (in-memory)')
    } catch (e) {
      setTanstackDbStatus(`error: ${String(e)}`)
    }
  }, [])

  // Add a new item to TanStack DB
  const addTanStackItem = useCallback(() => {
    if (!collectionRef.current) return

    const newItem: TodoItem = {
      id: `${Date.now()}`,
      title: `Task ${tanstackDbItems.length + 1}`,
      completed: false,
    }

    collectionRef.current.insert(newItem)
    const items = Array.from(collectionRef.current.state.values()) as TodoItem[]
    setTanstackDbItems(items)
  }, [tanstackDbItems.length])

  // Toggle item completion
  const toggleTanStackItem = useCallback((id: string) => {
    if (!collectionRef.current) return

    const item = collectionRef.current.state.get(id)
    if (item) {
      collectionRef.current.update(id, { ...item, completed: !item.completed })
      const items = Array.from(collectionRef.current.state.values()) as TodoItem[]
      setTanstackDbItems(items)
    }
  }, [])

  // Delete item
  const deleteTanStackItem = useCallback((id: string) => {
    if (!collectionRef.current) return

    collectionRef.current.delete(id)
    const items = Array.from(collectionRef.current.state.values()) as TodoItem[]
    setTanstackDbItems(items)
  }, [])

  // Drizzle ORM demo - using expo-sqlite
  const initDrizzle = useCallback(async () => {
    try {
      setDrizzleStatus('initializing…')

      // Dynamic import for Drizzle + expo-sqlite
      const { drizzle } = await import('drizzle-orm/expo-sqlite')
      const { openDatabaseSync } = await import('expo-sqlite')
      const schema = await import('lib/db/schema')

      // Open database
      const expoDb = openDatabaseSync(`drizzle_demo_${Date.now()}.db`)
      const db = drizzle(expoDb)

      // Create table
      expoDb.execSync(`
        CREATE TABLE IF NOT EXISTS todos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          completed INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL
        )
      `)

      // Insert sample data
      const now = new Date().toISOString()
      expoDb.execSync(`
        INSERT INTO todos (title, completed, created_at) VALUES
        ('Learn Drizzle ORM', 0, '${now}'),
        ('Build with expo-sqlite', 0, '${now}'),
        ('Ship to production', 1, '${now}')
      `)

      drizzleDbRef.current = db
      drizzleSchemaRef.current = schema

      // Fetch all todos
      const allTodos = db.select().from(schema.todos).all()
      setDrizzleTodos(allTodos as DrizzleTodo[])
      setDrizzleStatus('initialized (SQLite)')
    } catch (e) {
      setDrizzleStatus(`error: ${String(e)}`)
    }
  }, [])

  // Add new todo with Drizzle
  const addDrizzleTodo = useCallback(() => {
    if (!drizzleDbRef.current || !drizzleSchemaRef.current || !drizzleInput.trim()) return

    try {
      const db = drizzleDbRef.current
      const schema = drizzleSchemaRef.current

      db.insert(schema.todos)
        .values({
          title: drizzleInput.trim(),
          completed: false,
          createdAt: new Date().toISOString(),
        })
        .run()

      // Refresh list
      const allTodos = db.select().from(schema.todos).all()
      setDrizzleTodos(allTodos as DrizzleTodo[])
      setDrizzleInput('')
    } catch (e) {
      console.error('[Drizzle] Add error:', e)
    }
  }, [drizzleInput])

  // Toggle todo completion with Drizzle
  const toggleDrizzleTodo = useCallback((id: number, currentCompleted: boolean) => {
    if (!drizzleDbRef.current || !drizzleSchemaRef.current) return

    try {
      const db = drizzleDbRef.current
      const schema = drizzleSchemaRef.current

      db.update(schema.todos)
        .set({ completed: !currentCompleted })
        .where(eq(schema.todos.id, id))
        .run()

      // Refresh list
      const allTodos = db.select().from(schema.todos).all()
      setDrizzleTodos(allTodos as DrizzleTodo[])
    } catch (e) {
      console.error('[Drizzle] Toggle error:', e)
    }
  }, [])

  // Delete todo with Drizzle
  const deleteDrizzleTodo = useCallback((id: number) => {
    if (!drizzleDbRef.current || !drizzleSchemaRef.current) return

    try {
      const db = drizzleDbRef.current
      const schema = drizzleSchemaRef.current

      db.delete(schema.todos).where(eq(schema.todos.id, id)).run()

      // Refresh list
      const allTodos = db.select().from(schema.todos).all()
      setDrizzleTodos(allTodos as DrizzleTodo[])
    } catch (e) {
      console.error('[Drizzle] Delete error:', e)
    }
  }, [])

  // Resend email demo (mock - requires API key)
  const sendDemoEmail = useCallback(async () => {
    if (!emailTo.trim()) {
      setEmailStatus('Please enter an email address')
      return
    }

    try {
      setEmailStatus('sending…')
      // Note: This is a demo - actual sending requires valid API key and server-side execution
      // Resend API should be called from a backend, not directly from mobile app
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setEmailStatus(`Demo: Would send to ${emailTo} (requires backend)`)
    } catch (e) {
      setEmailStatus(`error: ${String(e)}`)
    }
  }, [emailTo])

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#000' }}
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

      {/* TanStack DB Demo */}
      <YStack gap="$2" w="100%" maw={420}>
        <Text fontSize={18} color="$color">
          🔥 TanStack DB (beta)
        </Text>
        <XStack gap="$2">
          <Button flex={1} onPress={initTanStackDB}>
            Initialize
          </Button>
          <Button
            flex={1}
            variant="outlined"
            onPress={addTanStackItem}
            disabled={!collectionRef.current}
          >
            Add Item
          </Button>
        </XStack>
        <Paragraph color="$gray11">Status: {tanstackDbStatus}</Paragraph>
        {tanstackDbItems.length > 0 && (
          <YStack bg="$gray3" p="$2" br="$3" gap="$2">
            {tanstackDbItems.map((item) => (
              <XStack key={item.id} ai="center" jc="space-between">
                <XStack ai="center" gap="$2" flex={1}>
                  <Text
                    color={item.completed ? '$green10' : '$color'}
                    fontSize={14}
                    textDecorationLine={item.completed ? 'line-through' : 'none'}
                    onPress={() => toggleTanStackItem(item.id)}
                  >
                    {item.completed ? '✓' : '○'} {item.title}
                  </Text>
                </XStack>
                <Text
                  color="$red10"
                  fontSize={12}
                  onPress={() => deleteTanStackItem(item.id)}
                >
                  ✕
                </Text>
              </XStack>
            ))}
          </YStack>
        )}
        <YStack bg="$blue3" p="$3" br="$3" gap="$1">
          <Text color="$blue11" fontWeight="bold" fontSize={13}>
            TanStack DB Features:
          </Text>
          <Text color="$blue11" fontSize={12}>
            • Live Queries - リアルタイム更新
          </Text>
          <Text color="$blue11" fontSize={12}>
            • RxDB統合 - @tanstack/rxdb-db-collection
          </Text>
          <Text color="$blue11" fontSize={12}>
            • TanStack Query統合 - @tanstack/query-db-collection
          </Text>
        </YStack>
      </YStack>

      <Separator />

      {/* Drizzle ORM Demo */}
      <YStack gap="$2" w="100%" maw={420}>
        <Text fontSize={18} color="$color">
          🌧️ Drizzle ORM + expo-sqlite
        </Text>
        <Button onPress={initDrizzle}>Initialize Drizzle</Button>
        <Paragraph color="$gray11">Status: {drizzleStatus}</Paragraph>

        {drizzleDbRef.current && (
          <XStack gap="$2">
            <Input
              flex={1}
              value={drizzleInput}
              onChangeText={setDrizzleInput}
              placeholder="New todo..."
              placeholderTextColor="#666"
            />
            <Button onPress={addDrizzleTodo} disabled={!drizzleInput.trim()}>
              Add
            </Button>
          </XStack>
        )}

        {drizzleTodos.length > 0 && (
          <YStack bg="$gray3" p="$2" br="$3" gap="$2">
            {drizzleTodos.map((todo) => (
              <XStack key={todo.id} ai="center" jc="space-between">
                <XStack ai="center" gap="$2" flex={1}>
                  <Text
                    color={todo.completed ? '$green10' : '$color'}
                    fontSize={14}
                    textDecorationLine={todo.completed ? 'line-through' : 'none'}
                    onPress={() => toggleDrizzleTodo(todo.id, todo.completed)}
                  >
                    {todo.completed ? '✓' : '○'} {todo.title}
                  </Text>
                </XStack>
                <Text
                  color="$red10"
                  fontSize={12}
                  onPress={() => deleteDrizzleTodo(todo.id)}
                >
                  ✕
                </Text>
              </XStack>
            ))}
          </YStack>
        )}

        <YStack bg="$purple3" p="$3" br="$3" gap="$1">
          <Text color="$purple11" fontWeight="bold" fontSize={13}>
            Drizzle Features:
          </Text>
          <Text color="$purple11" fontSize={12}>
            • Type-safe SQL queries
          </Text>
          <Text color="$purple11" fontSize={12}>
            • expo-sqlite integration
          </Text>
          <Text color="$purple11" fontSize={12}>
            • Schema migrations with drizzle-kit
          </Text>
        </YStack>
      </YStack>

      <Separator />

      {/* Resend + React Email Demo */}
      <YStack gap="$2" w="100%" maw={420}>
        <Text fontSize={18} color="$color">
          ✉️ Resend + React Email
        </Text>
        <YStack gap="$2">
          <Input
            value={emailTo}
            onChangeText={setEmailTo}
            placeholder="recipient@example.com"
            placeholderTextColor="#666"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Button onPress={sendDemoEmail}>Send Demo Email</Button>
        </YStack>
        <Paragraph color="$gray11">Status: {emailStatus}</Paragraph>

        <YStack bg="$cyan3" p="$3" br="$3" gap="$1">
          <Text color="$cyan11" fontWeight="bold" fontSize={13}>
            ⚠️ Important:
          </Text>
          <Text color="$cyan11" fontSize={12}>
            • Resend requires a backend (API key security)
          </Text>
          <Text color="$cyan11" fontSize={12}>
            • Use with Next.js API routes, Edge Functions, etc.
          </Text>
          <Text color="$cyan11" fontSize={12}>
            • React Email for building email templates
          </Text>
        </YStack>

        <YStack bg="$gray3" p="$3" br="$3" gap="$1">
          <Text color="$gray11" fontWeight="bold" fontSize={13}>
            Setup:
          </Text>
          <Text color="$gray10" fontSize={12}>
            1. Sign up at resend.com
          </Text>
          <Text color="$gray10" fontSize={12}>
            2. Get API key from dashboard
          </Text>
          <Text color="$gray10" fontSize={12}>
            3. Verify your domain
          </Text>
          <Text color="$gray10" fontSize={12}>
            4. Call API from your backend
          </Text>
        </YStack>
      </YStack>
    </ScrollView>
  )
}
