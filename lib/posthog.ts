/**
 * PostHog Analytics ユーティリティ
 *
 * 使用前に以下を設定してください：
 * 1. PostHog でプロジェクトを作成
 * 2. 環境変数 EXPO_PUBLIC_POSTHOG_API_KEY を設定
 *
 * ⚠️ Expo Go では動作しません。Development Build が必要です。
 */

import Constants, { ExecutionEnvironment } from 'expo-constants'

// Expo Go かどうかを判定（インポート前にチェック）
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient

// PostHogインスタンスの型（動的インポートのため any を使用）
// biome-ignore lint/suspicious/noExplicitAny: PostHog SDK の型定義が不完全なため
type PostHogInstance = any

// 遅延ロード用のPostHogインスタンス
let posthogInstance: PostHogInstance | null = null
let isInitialized = false

/**
 * PostHog インスタンスを遅延取得
 * Expo Go で動作時はインポートをスキップして null を返す
 */
export async function getPostHog(): Promise<PostHogInstance | null> {
	// Expo Go の場合はそもそもインポートを試みない
	if (isExpoGo) {
		if (!isInitialized) {
			console.log('[PostHog] Skipped: Running in Expo Go')
			isInitialized = true
		}
		return null
	}

	if (posthogInstance) return posthogInstance
	if (isInitialized) return null // 初期化済みだが失敗した場合

	const apiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY
	if (!apiKey) {
		console.log('[PostHog] API key not found')
		isInitialized = true
		return null
	}

	try {
		const { PostHog } = await import('posthog-react-native')
		// biome-ignore lint/suspicious/noExplicitAny: PostHog SDK の型定義が不完全なため
		posthogInstance = new (PostHog as any)(apiKey, {
			host: 'https://us.i.posthog.com', // EU の場合は 'https://eu.i.posthog.com'
		})
		isInitialized = true
		return posthogInstance
	} catch {
		console.log('[PostHog] PostHog is not available')
		isInitialized = true
		return null
	}
}

/**
 * カスタムイベントをキャプチャ
 */
export async function capture(
	eventName: string,
	properties?: Record<string, unknown>,
) {
	const posthog = await getPostHog()
	if (!posthog) return

	posthog.capture(eventName, properties)
}

/**
 * スクリーン閲覧をログ
 */
export async function screen(screenName: string, properties?: Record<string, unknown>) {
	const posthog = await getPostHog()
	if (!posthog) return

	posthog.screen(screenName, properties)
}

/**
 * ユーザーを識別
 */
export async function identify(
	userId: string,
	properties?: Record<string, unknown>,
) {
	const posthog = await getPostHog()
	if (!posthog) return

	posthog.identify(userId, properties)
}

/**
 * ユーザーをリセット（ログアウト時）
 */
export async function reset() {
	const posthog = await getPostHog()
	if (!posthog) return

	posthog.reset()
}

/**
 * ユーザープロパティを追加
 */
export async function setPersonProperties(
	properties: Record<string, unknown>,
	propertiesSetOnce?: Record<string, unknown>,
) {
	const posthog = await getPostHog()
	if (!posthog) return

	posthog.setPersonProperties(properties, propertiesSetOnce)
}

/**
 * グループを設定
 */
export async function group(
	groupType: string,
	groupKey: string,
	groupProperties?: Record<string, unknown>,
) {
	const posthog = await getPostHog()
	if (!posthog) return

	posthog.group(groupType, groupKey, groupProperties)
}

/**
 * Feature Flag の値を取得
 */
export async function getFeatureFlag(
	flagKey: string,
): Promise<boolean | string | undefined> {
	const posthog = await getPostHog()
	if (!posthog) return undefined

	return posthog.getFeatureFlag(flagKey)
}

/**
 * Feature Flag が有効かチェック
 */
export async function isFeatureEnabled(flagKey: string): Promise<boolean> {
	const posthog = await getPostHog()
	if (!posthog) return false

	return posthog.isFeatureEnabled(flagKey) ?? false
}

/**
 * Feature Flags をリロード
 */
export async function reloadFeatureFlags() {
	const posthog = await getPostHog()
	if (!posthog) return

	posthog.reloadFeatureFlags()
}

/**
 * PostHog を有効/無効を切り替え（オプトアウト対応）
 */
export async function optIn() {
	const posthog = await getPostHog()
	if (!posthog) return

	posthog.optIn()
}

export async function optOut() {
	const posthog = await getPostHog()
	if (!posthog) return

	posthog.optOut()
}

/**
 * セッションを手動でフラッシュ
 */
export async function flush() {
	const posthog = await getPostHog()
	if (!posthog) return

	await posthog.flush()
}
