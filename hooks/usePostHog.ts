/**
 * PostHog Hooks
 *
 * Expo Go 対応の動的インポート版 PostHog フック
 */

import { usePathname } from 'expo-router'
import { useEffect, useRef } from 'react'
import * as posthog from '../lib/posthog'

/**
 * 画面遷移を自動トラッキング
 * app/_layout.tsx で使用
 */
export function useTrackScreenViews() {
	const pathname = usePathname()
	const previousPathname = useRef<string | null>(null)

	useEffect(() => {
		// 初回 or パス変更時のみトラック
		if (pathname && pathname !== previousPathname.current) {
			posthog.screen(pathname)
			previousPathname.current = pathname
		}
	}, [pathname])
}

/**
 * PostHog のユーティリティ関数をまとめて返す
 */
export function usePostHogActions() {
	return {
		capture: posthog.capture,
		screen: posthog.screen,
		identify: posthog.identify,
		reset: posthog.reset,
		setPersonProperties: posthog.setPersonProperties,
		group: posthog.group,
		getFeatureFlag: posthog.getFeatureFlag,
		isFeatureEnabled: posthog.isFeatureEnabled,
		reloadFeatureFlags: posthog.reloadFeatureFlags,
		optIn: posthog.optIn,
		optOut: posthog.optOut,
		flush: posthog.flush,
	}
}
