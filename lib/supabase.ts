import AsyncStorage from '@react-native-async-storage/async-storage'
import { type SupabaseClient, createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

// Supabase設定（環境変数から取得）
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''

/**
 * セキュアなストレージアダプター
 * - ネイティブ: expo-secure-store（暗号化）
 * - Web: AsyncStorage
 */
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem(key)
    }
    return SecureStore.getItemAsync(key)
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, value)
    } else {
      await SecureStore.setItemAsync(key, value)
    }
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(key)
    } else {
      await SecureStore.deleteItemAsync(key)
    }
  },
}

/**
 * Database型（プロジェクトに合わせて生成する）
 * npx supabase gen types typescript --project-id <project-id> > lib/database.types.ts
 */
// biome-ignore lint/suspicious/noExplicitAny: Database types will be generated per project
export type Database = any

// Supabase が設定されているかどうか
export const isSupabaseEnabled = !!(supabaseUrl && supabaseAnonKey)

/**
 * Supabaseクライアント（環境変数が設定されている場合のみ有効）
 */
export const supabase: SupabaseClient<Database> | null = isSupabaseEnabled
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // React Nativeでは不要
      },
    })
  : null
