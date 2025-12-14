import Constants, { ExecutionEnvironment } from 'expo-constants'

// Expo Go かどうかを判定（インポート前にチェック）
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient

// Datadog設定（環境変数から取得するか、ここで設定）
const DATADOG_CONFIG = {
  clientToken: process.env.EXPO_PUBLIC_DATADOG_CLIENT_TOKEN || 'YOUR_CLIENT_TOKEN',
  environment: process.env.EXPO_PUBLIC_DATADOG_ENV || 'development',
  applicationId: process.env.EXPO_PUBLIC_DATADOG_APP_ID || 'YOUR_APPLICATION_ID',
  site: 'US1', // 'US1', 'US3', 'US5', 'EU1', 'AP1' など
}

// Datadog SDKの型定義（anyで安全に）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let datadogModule: any = null
let isInitialized = false

/**
 * Datadogを初期化（Expo Goでは何もしない）
 */
export async function initializeDatadog(): Promise<boolean> {
  if (isExpoGo) {
    console.log('[Datadog] Skipped: Running in Expo Go')
    return false
  }

  if (isInitialized) {
    console.log('[Datadog] Already initialized')
    return true
  }

  try {
    // 動的インポート
    datadogModule = await import('@datadog/mobile-react-native')
    const { DdSdkReactNative, DdSdkReactNativeConfiguration } = datadogModule

    const config = new DdSdkReactNativeConfiguration(
      DATADOG_CONFIG.clientToken,
      DATADOG_CONFIG.environment,
      DATADOG_CONFIG.applicationId,
      true, // trackUserInteractions
      true, // trackXHRResources
      true  // trackErrors
    )

    // 追加設定
    config.site = DATADOG_CONFIG.site
    config.nativeCrashReportEnabled = true
    config.sessionSamplingRate = 100
    config.resourceTracingSamplingRate = 20

    await DdSdkReactNative.initialize(config)
    isInitialized = true
    console.log('[Datadog] Initialized successfully')
    return true
  } catch (error) {
    console.warn('[Datadog] Failed to initialize:', error)
    return false
  }
}

/**
 * 画面遷移を記録
 */
export async function trackView(viewName: string, viewKey?: string): Promise<void> {
  if (isExpoGo || !datadogModule) return

  try {
    const { DdRum } = datadogModule
    await DdRum.startView(viewKey || viewName, viewName, {})
  } catch (error) {
    console.warn('[Datadog] trackView error:', error)
  }
}

/**
 * 画面遷移の終了を記録
 */
export async function stopView(viewKey: string): Promise<void> {
  if (isExpoGo || !datadogModule) return

  try {
    const { DdRum } = datadogModule
    await DdRum.stopView(viewKey, {})
  } catch (error) {
    console.warn('[Datadog] stopView error:', error)
  }
}

/**
 * カスタムアクションを記録
 */
export async function trackAction(
  type: 'tap' | 'scroll' | 'swipe' | 'custom',
  name: string,
  context?: Record<string, unknown>
): Promise<void> {
  if (isExpoGo || !datadogModule) return

  try {
    const { DdRum, RumActionType } = datadogModule
    const actionTypeMap = {
      tap: RumActionType.TAP,
      scroll: RumActionType.SCROLL,
      swipe: RumActionType.SWIPE,
      custom: RumActionType.CUSTOM,
    }
    await DdRum.addAction(actionTypeMap[type], name, context || {})
  } catch (error) {
    console.warn('[Datadog] trackAction error:', error)
  }
}

/**
 * エラーを記録
 */
export async function trackError(
  message: string,
  source: 'source' | 'network' | 'console' | 'custom',
  stacktrace?: string,
  context?: Record<string, unknown>
): Promise<void> {
  if (isExpoGo || !datadogModule) return

  try {
    const { DdRum, ErrorSource } = datadogModule
    const sourceMap = {
      source: ErrorSource.SOURCE,
      network: ErrorSource.NETWORK,
      console: ErrorSource.CONSOLE,
      custom: ErrorSource.CUSTOM,
    }
    await DdRum.addError(message, sourceMap[source], stacktrace || '', context || {})
  } catch (error) {
    console.warn('[Datadog] trackError error:', error)
  }
}

/**
 * ログを送信
 */
export async function log(
  message: string,
  level: 'debug' | 'info' | 'warn' | 'error' = 'info',
  context?: Record<string, unknown>
): Promise<void> {
  if (isExpoGo || !datadogModule) return

  try {
    const { DdLogs } = datadogModule
    switch (level) {
      case 'debug':
        await DdLogs.debug(message, context || {})
        break
      case 'info':
        await DdLogs.info(message, context || {})
        break
      case 'warn':
        await DdLogs.warn(message, context || {})
        break
      case 'error':
        await DdLogs.error(message, context || {})
        break
    }
  } catch (error) {
    console.warn('[Datadog] log error:', error)
  }
}

/**
 * ユーザー情報を設定
 */
export async function setUser(
  id: string,
  email?: string,
  name?: string,
  extraInfo?: Record<string, unknown>
): Promise<void> {
  if (isExpoGo || !datadogModule) return

  try {
    const { DdSdkReactNative } = datadogModule
    await DdSdkReactNative.setUser({ id, email, name, ...extraInfo })
  } catch (error) {
    console.warn('[Datadog] setUser error:', error)
  }
}

/**
 * Expo Goで実行中かどうかを取得
 */
export function isRunningInExpoGo(): boolean {
  return isExpoGo
}

/**
 * Datadogが初期化済みかどうかを取得
 */
export function isDatadogInitialized(): boolean {
  return isInitialized
}
