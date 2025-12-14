/**
 * Firebase Analytics ユーティリティ
 *
 * 使用前に以下を設定してください：
 * 1. Firebase Console でプロジェクトを作成
 * 2. GoogleService-Info.plist (iOS) と google-services.json (Android) をプロジェクトルートに配置
 * 3. npx expo prebuild --clean を実行
 *
 * ⚠️ Expo Go では動作しません。Development Build が必要です。
 */

import Constants, { ExecutionEnvironment } from 'expo-constants'
import type analytics from '@react-native-firebase/analytics'

// Expo Go かどうかを判定（インポート前にチェック）
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient

// 遅延ロード用のモジュール参照
let analyticsModule: typeof analytics | null = null
let isAvailable: boolean | null = null

/**
 * Analytics モジュールを遅延取得
 * Expo Go で動作時はインポートをスキップして null を返す
 */
async function getAnalytics() {
  // Expo Go の場合はそもそもインポートを試みない
  if (isExpoGo) {
    if (isAvailable === null) {
      console.log('[Analytics] Skipped: Running in Expo Go')
      isAvailable = false
    }
    return null
  }

  // 一度利用不可と判定されたらスキップ
  if (isAvailable === false) return null
  if (analyticsModule) return analyticsModule

  try {
    const module = await import('@react-native-firebase/analytics')
    // ネイティブモジュールが存在するかテスト
    const instance = module.default()
    // アプリインスタンスIDを取得してテスト（エラーが出れば未設定）
    await instance.getAppInstanceId()
    analyticsModule = module.default
    isAvailable = true
    return analyticsModule
  } catch {
    console.log('[Analytics] Skipped: Firebase not configured')
    isAvailable = false
    return null
  }
}

/**
 * スクリーン閲覧をログ
 */
export async function logScreenView(screenName: string, screenClass?: string) {
  try {
    const analytics = await getAnalytics()
    if (!analytics) return

    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass ?? screenName,
    })
  } catch {
    // silently ignore
  }
}

/**
 * カスタムイベントをログ
 */
export async function logEvent(
  eventName: string,
  params?: Record<string, unknown>,
) {
  try {
    const analytics = await getAnalytics()
    if (!analytics) return

    await analytics().logEvent(eventName, params)
  } catch {
    // silently ignore
  }
}

/**
 * ユーザープロパティを設定
 */
export async function setUserProperty(name: string, value: string) {
  try {
    const analytics = await getAnalytics()
    if (!analytics) return

    await analytics().setUserProperty(name, value)
  } catch {
    // silently ignore
  }
}

/**
 * ユーザーIDを設定
 */
export async function setUserId(userId: string | null) {
  try {
    const analytics = await getAnalytics()
    if (!analytics) return

    await analytics().setUserId(userId)
  } catch {
    // silently ignore
  }
}

/**
 * ログインイベント
 */
export async function logLogin(method: string) {
  try {
    const analytics = await getAnalytics()
    if (!analytics) return

    await analytics().logLogin({ method })
  } catch {
    // silently ignore
  }
}

/**
 * サインアップイベント
 */
export async function logSignUp(method: string) {
  try {
    const analytics = await getAnalytics()
    if (!analytics) return

    await analytics().logSignUp({ method })
  } catch {
    // silently ignore
  }
}

/**
 * 購入イベント
 */
export async function logPurchase(params: {
  currency: string
  value: number
  items?: Array<{ item_id: string; item_name: string }>
}) {
  try {
    const analytics = await getAnalytics()
    if (!analytics) return

    await analytics().logPurchase(params)
  } catch {
    // silently ignore
  }
}

/**
 * 検索イベント
 */
export async function logSearch(searchTerm: string) {
  try {
    const analytics = await getAnalytics()
    if (!analytics) return

    await analytics().logSearch({ search_term: searchTerm })
  } catch {
    // silently ignore
  }
}

/**
 * シェアイベント
 */
export async function logShare(
  contentType: string,
  itemId: string,
  method: string,
) {
  try {
    const analytics = await getAnalytics()
    if (!analytics) return

    await analytics().logShare({
      content_type: contentType,
      item_id: itemId,
      method,
    })
  } catch {
    // silently ignore
  }
}

/**
 * Analytics の有効/無効を切り替え（オプトアウト対応）
 */
export async function setAnalyticsCollectionEnabled(enabled: boolean) {
  try {
    const analytics = await getAnalytics()
    if (!analytics) return

    await analytics().setAnalyticsCollectionEnabled(enabled)
  } catch {
    // silently ignore
  }
}
