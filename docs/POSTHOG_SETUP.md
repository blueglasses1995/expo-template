# PostHog セットアップガイド

このテンプレートでは PostHog を使用してプロダクト分析、Feature Flags、セッションリプレイなどを利用できます。

---

## 📋 目次

1. [前提条件](#1-前提条件)
2. [PostHog プロジェクトの作成](#2-posthog-プロジェクトの作成)
3. [環境変数の設定](#3-環境変数の設定)
4. [Development Build の作成](#4-development-build-の作成)
5. [PostHog の使い方](#5-posthog-の使い方)
6. [Feature Flags の使い方](#6-feature-flags-の使い方)
7. [データの確認方法](#7-データの確認方法)
8. [トラブルシューティング](#8-トラブルシューティング)

---

## 1. 前提条件

- ✅ `posthog-react-native` インストール済み
- ✅ `expo-application` インストール済み
- ✅ `expo-device` インストール済み
- ✅ `expo-file-system` インストール済み
- ✅ `expo-localization` インストール済み

⚠️ **重要**: PostHog は **Expo Go では動作しません**。Development Build が必要です。
ただし、このテンプレートでは動的インポートを使用しているため、Expo Go でもエラーは発生せず、単にスキップされます。

---

## 2. PostHog プロジェクトの作成

### Step 1: PostHog にサインアップ

1. [https://posthog.com](https://posthog.com) にアクセス
2. 「Get started - free」をクリック
3. アカウントを作成（Google / GitHub / Email）

### Step 2: プロジェクトを作成

1. Organization を作成（または既存を選択）
2. Project を作成
3. **Region を選択**:
   - 🇺🇸 US Cloud: `https://us.i.posthog.com`
   - 🇪🇺 EU Cloud: `https://eu.i.posthog.com`

### Step 3: API Key を取得

1. Settings → Project → **Project API Key**
2. `phc_` で始まる API Key をコピー

---

## 3. 環境変数の設定

### ローカル開発

プロジェクトルートに `.env` ファイルを作成：

```bash
EXPO_PUBLIC_POSTHOG_API_KEY=phc_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### EAS Build（本番）

```bash
# EAS Secrets に追加
eas secret:create --name EXPO_PUBLIC_POSTHOG_API_KEY --value phc_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### リージョン設定（オプション）

EU リージョンを使用する場合は `lib/posthog.ts` を編集：

```typescript
posthogInstance = new PostHog(apiKey, {
  host: 'https://eu.i.posthog.com', // ← EU に変更
})
```

---

## 4. Development Build の作成

PostHog はネイティブモジュールを使用するため、Development Build が必要です。

### ローカルビルド

```bash
# ネイティブプロジェクトを生成
npx expo prebuild --clean

# iOS ビルド＆実行
npx expo run:ios

# Android ビルド＆実行
npx expo run:android
```

### EAS Build（クラウドビルド）

```bash
# EAS CLI のインストール（初回のみ）
npm install -g eas-cli

# ログイン
eas login

# Development Build の作成
eas build --profile development --platform all
```

---

## 5. PostHog の使い方

### 自動画面トラッキング

`app/_layout.tsx` で画面遷移が自動的にトラッキングされます。追加設定は不要です。

### カスタムイベントの送信

```typescript
import { capture } from 'lib/posthog'

// ボタンクリック
await capture('button_clicked', {
  button_name: 'submit',
  screen: 'home',
})

// 購入完了
await capture('purchase_completed', {
  product_id: 'premium_plan',
  price: 1000,
  currency: 'JPY',
})

// チュートリアル完了
await capture('tutorial_completed', {
  step_count: 5,
  duration_seconds: 120,
})
```

### ユーザー識別

```typescript
import { identify, reset, setPersonProperties } from 'lib/posthog'

// ログイン時
await identify('user_12345', {
  email: 'user@example.com',
  name: '山田太郎',
  plan: 'premium',
})

// ユーザープロパティの追加
await setPersonProperties(
  { last_login: new Date().toISOString() },  // 毎回更新
  { first_login: new Date().toISOString() }  // 初回のみ
)

// ログアウト時（匿名ユーザーにリセット）
await reset()
```

### グループ（会社・チーム単位の分析）

```typescript
import { group } from 'lib/posthog'

// 会社に所属
await group('company', 'company_123', {
  name: '株式会社サンプル',
  plan: 'enterprise',
  employee_count: 50,
})
```

### オプトアウト対応

```typescript
import { optIn, optOut } from 'lib/posthog'

// ユーザーがトラッキングを拒否した場合
await optOut()

// ユーザーが許可した場合
await optIn()
```

### Hooks を使用する場合

```typescript
import { usePostHogActions } from 'hooks/usePostHog'

function MyComponent() {
  const { capture, identify } = usePostHogActions()

  const handlePress = async () => {
    await capture('cta_pressed', { location: 'header' })
  }

  return <Button onPress={handlePress}>CTA</Button>
}
```

---

## 6. Feature Flags の使い方

PostHog の強力な機能の一つが Feature Flags です。

### Feature Flag の作成（PostHog Dashboard）

1. PostHog Dashboard → Feature Flags
2. 「New feature flag」をクリック
3. Flag key を入力（例: `new-checkout-flow`）
4. ロールアウト条件を設定（例: 50% のユーザー）
5. 保存

### コードでの使用

```typescript
import { isFeatureEnabled, getFeatureFlag, reloadFeatureFlags } from 'lib/posthog'

// Boolean フラグ
const showNewUI = await isFeatureEnabled('new-checkout-flow')
if (showNewUI) {
  // 新しいUIを表示
}

// Multivariate フラグ
const variant = await getFeatureFlag('pricing-experiment')
// variant = 'control' | 'variant-a' | 'variant-b' | undefined

// フラグを再取得（ユーザー情報変更後など）
await reloadFeatureFlags()
```

### React Hook での使用

```typescript
import { usePostHogActions } from 'hooks/usePostHog'
import { useEffect, useState } from 'react'

function PricingPage() {
  const { isFeatureEnabled } = usePostHogActions()
  const [showNewPricing, setShowNewPricing] = useState(false)

  useEffect(() => {
    isFeatureEnabled('new-pricing-page').then(setShowNewPricing)
  }, [])

  if (showNewPricing) {
    return <NewPricingUI />
  }
  return <OldPricingUI />
}
```

---

## 7. データの確認方法

### リアルタイム確認（Live Events）

1. PostHog Dashboard → **Activity** → **Live events**
2. アプリを Development Build で起動
3. イベントがリアルタイムで表示される

### ダッシュボード

1. PostHog Dashboard → **Dashboards**
2. 「New dashboard」で分析ダッシュボードを作成
3. Insights を追加してデータを可視化

### Insights（分析）

1. PostHog Dashboard → **Insights**
2. 分析タイプを選択:
   - **Trends**: イベントの推移
   - **Funnels**: コンバージョンファネル
   - **Retention**: リテンション分析
   - **Paths**: ユーザージャーニー
   - **Stickiness**: 習慣化の分析

### Persons（ユーザー）

1. PostHog Dashboard → **Persons & groups** → **Persons**
2. 個別ユーザーの行動履歴を確認
3. `identify()` で設定したプロパティが表示される

---

## 8. トラブルシューティング

### 「Expo Go で動作しない」

**原因**: PostHog はネイティブモジュールを使用するため、Expo Go では動作しません。

**解決策**: Development Build を使用してください。このテンプレートでは動的インポートを使用しているため、Expo Go でもエラーは発生せず、単にスキップされます。

```bash
npx expo prebuild --clean
npx expo run:ios  # または run:android
```

### 「イベントが PostHog に表示されない」

**原因1**: 環境変数が設定されていない

```bash
# .env ファイルを確認
cat .env

# 出力例:
# EXPO_PUBLIC_POSTHOG_API_KEY=phc_xxxxx
```

**原因2**: API Key が間違っている

→ PostHog Dashboard → Settings → Project → Project API Key を再確認

**原因3**: host が間違っている

→ EU リージョンの場合は `lib/posthog.ts` の host を `https://eu.i.posthog.com` に変更

### 「Feature Flags が取得できない」

**原因1**: ユーザーが identify されていない

→ Feature Flags のロールアウト条件によっては、`identify()` が必要

**原因2**: フラグがキャッシュされている

```typescript
// フラグを強制再取得
await reloadFeatureFlags()
```

### 「セキュリティ警告が表示される」

**原因**: `posthog-react-native` のバージョン 4.11.1〜4.12.5 には悪意のあるコードが含まれていました。

**解決策**: 必ず **4.12.5 より新しいバージョン** を使用してください。

```bash
# バージョン確認
npm list posthog-react-native

# アップデート
npx expo install posthog-react-native
```

---

## 📁 関連ファイル

```
lib/
└── posthog.ts                # PostHog ユーティリティ（動的インポート対応）

hooks/
└── usePostHog.ts             # PostHog React Hooks

app/
└── _layout.tsx               # 自動画面トラッキング

プロジェクトルート/
└── .env                      # 環境変数（要作成）
```

---

## 📊 利用可能なイベント一覧

### 自動収集イベント

| イベント | 説明 |
|---------|------|
| `Application Installed` | アプリインストール |
| `Application Opened` | アプリ起動 |
| `Application Backgrounded` | アプリがバックグラウンドへ |
| `$screen` | 画面表示（自動トラッキング設定済み） |

### 推奨カスタムイベント

| イベント | 用途 | 例 |
|---------|------|-----|
| `signed_up` | 新規登録 | `{ method: 'email' }` |
| `logged_in` | ログイン | `{ method: 'google' }` |
| `logged_out` | ログアウト | - |
| `purchase_completed` | 購入完了 | `{ product_id, price, currency }` |
| `subscription_started` | サブスク開始 | `{ plan: 'premium' }` |
| `feature_used` | 機能利用 | `{ feature_name: 'export' }` |
| `error_occurred` | エラー発生 | `{ error_type, message }` |

---

## 🆚 Firebase Analytics との違い

| 項目 | PostHog | Firebase Analytics |
|-----|---------|-------------------|
| **主な用途** | プロダクト分析・A/Bテスト | マーケティング分析 |
| **Feature Flags** | ✅ 組み込み | ❌ Remote Config で代替 |
| **Session Replay** | ✅ 対応 | ❌ 非対応 |
| **Experiments** | ✅ 組み込み | △ Firebase A/B Testing |
| **自己ホスト** | ✅ 可能 | ❌ 不可 |
| **料金** | 月100万イベント無料 | 無料（制限あり） |
| **データ所有** | ✅ 完全 | △ Google管理 |

💡 **推奨**: プロダクト分析には PostHog、広告・マーケティング分析には Firebase Analytics を併用

---

## 🔗 参考リンク

- [PostHog 公式ドキュメント](https://posthog.com/docs)
- [PostHog React Native SDK](https://posthog.com/docs/libraries/react-native)
- [Feature Flags ガイド](https://posthog.com/docs/feature-flags)
- [Experiments ガイド](https://posthog.com/docs/experiments)
- [PostHog 料金](https://posthog.com/pricing)
