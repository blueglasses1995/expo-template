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

import type analytics from '@react-native-firebase/analytics'

// 遅延ロード用のモジュール参照
let analyticsModule: typeof analytics | null = null

/**
 * Analytics モジュールを遅延取得
 * Expo Go で動作時はエラーをキャッチして null を返す
 */
async function getAnalytics() {
  if (analyticsModule) return analyticsModule

  try {
    const module = await import('@react-native-firebase/analytics')
    analyticsModule = module.default
    return analyticsModule
  } catch (error) {
    console.log('[Analytics] Firebase Analytics is not available (Expo Go?)')
    return null
  }
}

/**
 * スクリーン閲覧をログ
 */
export async function logScreenView(screenName: string, screenClass?: string) {
  const analytics = await getAnalytics()
  if (!analytics) return

  await analytics().logScreenView({
    screen_name: screenName,
    screen_class: screenClass ?? screenName,
  })
}

/**
 * カスタムイベントをログ
 */
export async function logEvent(
  eventName: string,
  params?: Record<string, unknown>,
) {
  const analytics = await getAnalytics()
  if (!analytics) return

  await analytics().logEvent(eventName, params)
}

/**
 * ユーザープロパティを設定
 */
export async function setUserProperty(name: string, value: string) {
  const analytics = await getAnalytics()
  if (!analytics) return

  await analytics().setUserProperty(name, value)
}

/**
 * ユーザーIDを設定
 */
export async function setUserId(userId: string | null) {
  const analytics = await getAnalytics()
  if (!analytics) return

  await analytics().setUserId(userId)
}

/**
 * ログインイベント
 */
export async function logLogin(method: string) {
  const analytics = await getAnalytics()
  if (!analytics) return

  await analytics().logLogin({ method })
}

/**
 * サインアップイベント
 */
export async function logSignUp(method: string) {
  const analytics = await getAnalytics()
  if (!analytics) return

  await analytics().logSignUp({ method })
}

/**
 * 購入イベント
 */
export async function logPurchase(params: {
  currency: string
  value: number
  items?: Array<{ item_id: string; item_name: string }>
}) {
  const analytics = await getAnalytics()
  if (!analytics) return

  await analytics().logPurchase(params)
}

/**
 * 検索イベント
 */
export async function logSearch(searchTerm: string) {
  const analytics = await getAnalytics()
  if (!analytics) return

  await analytics().logSearch({ search_term: searchTerm })
}

/**
 * シェアイベント
 */
export async function logShare(
  contentType: string,
  itemId: string,
  method: string,
) {
  const analytics = await getAnalytics()
  if (!analytics) return

  await analytics().logShare({
    content_type: contentType,
    item_id: itemId,
    method,
  })
}

/**
 * Analytics の有効/無効を切り替え（オプトアウト対応）
 */
export async function setAnalyticsCollectionEnabled(enabled: boolean) {
  const analytics = await getAnalytics()
  if (!analytics) return

  await analytics().setAnalyticsCollectionEnabled(enabled)
}
