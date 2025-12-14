import { ConvexReactClient } from 'convex/react'

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL

// Convex クライアントのインスタンス（環境変数が設定されている場合のみ）
export const convex = convexUrl
  ? new ConvexReactClient(convexUrl, {
      unsavedChangesWarning: false,
    })
  : null

// Convex が設定されているかどうか
export const isConvexEnabled = !!convex
