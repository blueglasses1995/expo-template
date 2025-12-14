# Firebase Analytics セットアップガイド

このテンプレートでは Firebase Analytics（Google Analytics）を使用してアプリの利用状況を分析できます。

---

## 📋 目次

1. [前提条件](#1-前提条件)
2. [Firebase プロジェクトの作成](#2-firebase-プロジェクトの作成)
3. [設定ファイルの配置](#3-設定ファイルの配置)
4. [Development Build の作成](#4-development-build-の作成)
5. [Analytics の使い方](#5-analytics-の使い方)
6. [データの確認方法](#6-データの確認方法)
7. [トラブルシューティング](#7-トラブルシューティング)

---

## 1. 前提条件

- ✅ `@react-native-firebase/app` インストール済み
- ✅ `@react-native-firebase/analytics` インストール済み
- ✅ `expo-dev-client` インストール済み
- ✅ `expo-tracking-transparency` インストール済み（iOS ATT対応）

⚠️ **重要**: Firebase Analytics は **Expo Go では動作しません**。Development Build が必要です。

---

## 2. Firebase プロジェクトの作成

### Step 1: Firebase Console にアクセス

1. [https://console.firebase.google.com/](https://console.firebase.google.com/) にアクセス
2. Google アカウントでログイン

### Step 2: プロジェクトを作成

1. 「プロジェクトを追加」をクリック
2. プロジェクト名を入力（例: `my-expo-app`）
3. **「このプロジェクトで Google Analytics を有効にする」を ON にする**（重要！）
4. Google Analytics アカウントを選択または作成
5. 「プロジェクトを作成」をクリック

### Step 3: iOS アプリを登録

1. プロジェクト概要で「iOS」アイコンをクリック
2. **Apple バンドル ID**: `com.example.expotemplate`
3. アプリのニックネーム（任意）: `My Expo App`
4. 「アプリを登録」をクリック
5. **`GoogleService-Info.plist` をダウンロード**
6. 残りのステップはスキップ可能

### Step 4: Android アプリを登録

1. プロジェクト概要で「Android」アイコンをクリック
2. **Android パッケージ名**: `com.example.expotemplate`
3. アプリのニックネーム（任意）: `My Expo App`
4. 「アプリを登録」をクリック
5. **`google-services.json` をダウンロード**
6. 残りのステップはスキップ可能

---

## 3. 設定ファイルの配置

ダウンロードした設定ファイルをプロジェクトルートに配置します：

```
expo-template/
├── GoogleService-Info.plist   ← iOS 用
├── google-services.json       ← Android 用
├── app.json
├── package.json
└── ...
```

### 確認: app.json の設定

`app.json` に以下が設定されていることを確認：

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.example.expotemplate",
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "android": {
      "package": "com.example.expotemplate",
      "googleServicesFile": "./google-services.json"
    },
    "plugins": [
      "@react-native-firebase/app"
    ]
  }
}
```

---

## 4. Development Build の作成

Firebase Analytics はネイティブモジュールを使用するため、prebuild と ビルドが必要です。

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

## 5. Analytics の使い方

### 自動画面トラッキング

`app/_layout.tsx` で画面遷移が自動的にトラッキングされます。追加設定は不要です。

### カスタムイベントの送信

```typescript
import { logEvent, logLogin, logPurchase } from 'lib/analytics'

// カスタムイベント
await logEvent('button_click', {
  button_name: 'submit',
  screen: 'home',
})

// ログインイベント
await logLogin('google')  // or 'apple', 'email', etc.

// サインアップイベント
await logSignUp('email')

// 購入イベント
await logPurchase({
  currency: 'JPY',
  value: 1000,
  items: [
    { item_id: 'premium_plan', item_name: 'プレミアムプラン' },
  ],
})

// 検索イベント
await logSearch('キーワード')

// シェアイベント
await logShare('article', 'article_123', 'twitter')
```

### ユーザー識別

```typescript
import { setUserId, setUserProperty } from 'lib/analytics'

// ユーザーID（認証後に設定）
await setUserId('user_12345')

// ユーザープロパティ
await setUserProperty('subscription_tier', 'premium')
await setUserProperty('preferred_language', 'ja')
```

### Analytics の有効/無効切り替え（オプトアウト対応）

```typescript
import { setAnalyticsCollectionEnabled } from 'lib/analytics'

// 無効化（ユーザーがオプトアウトした場合）
await setAnalyticsCollectionEnabled(false)

// 有効化
await setAnalyticsCollectionEnabled(true)
```

---

## 6. データの確認方法

### リアルタイム確認（DebugView）

開発中にリアルタイムでイベントを確認できます。

1. Firebase Console → Analytics → **DebugView**
2. アプリを Development Build で起動
3. イベントがリアルタイムで表示される

### ダッシュボード

通常のデータは反映まで **数時間〜24時間** かかります。

1. Firebase Console → Analytics → **Dashboard**
2. イベント、ユーザー、リテンションなどを確認

### イベント一覧

1. Firebase Console → Analytics → **Events**
2. `screen_view`、カスタムイベントなどが表示される

---

## 7. トラブルシューティング

### 「Expo Go で動作しない」

**原因**: Firebase Analytics はネイティブモジュールを使用するため、Expo Go では動作しません。

**解決策**: Development Build を使用してください。

```bash
npx expo prebuild --clean
npx expo run:ios  # または run:android
```

### 「データが Firebase Console に表示されない」

**原因1**: 設定ファイルが配置されていない

→ `GoogleService-Info.plist` と `google-services.json` がプロジェクトルートにあることを確認

**原因2**: prebuild していない

→ `npx expo prebuild --clean` を実行後、再ビルド

**原因3**: 反映に時間がかかる

→ 通常のダッシュボードは24時間程度かかることがある。DebugView で即時確認可能

### 「iOS で ATT ダイアログが表示されない」

iOS 14.5以降では App Tracking Transparency（ATT）の許可が必要です。

```typescript
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency'

async function requestTracking() {
  const { status } = await requestTrackingPermissionsAsync()
  if (status === 'granted') {
    console.log('トラッキング許可')
  } else {
    console.log('トラッキング拒否')
  }
}

// アプリ起動時に呼び出す
```

---

## 📁 関連ファイル

```
lib/
└── analytics.ts              # Analytics ユーティリティ

app/
└── _layout.tsx               # 自動画面トラッキング

プロジェクトルート/
├── GoogleService-Info.plist  # iOS 設定（要配置）
├── google-services.json      # Android 設定（要配置）
└── app.json                  # Firebase plugin 設定
```

---

## 📊 利用可能なイベント一覧

### 自動収集イベント

| イベント | 説明 |
|---------|------|
| `first_open` | アプリ初回起動 |
| `session_start` | セッション開始 |
| `screen_view` | 画面表示（自動トラッキング設定済み） |
| `app_update` | アプリ更新後の初回起動 |

### 推奨イベント（lib/analytics.ts で定義済み）

| 関数 | イベント | 用途 |
|-----|---------|------|
| `logLogin()` | `login` | ログイン成功 |
| `logSignUp()` | `sign_up` | 新規登録 |
| `logPurchase()` | `purchase` | 購入完了 |
| `logSearch()` | `search` | 検索実行 |
| `logShare()` | `share` | コンテンツ共有 |
| `logScreenView()` | `screen_view` | 画面表示（手動） |

### カスタムイベント

```typescript
// 任意のイベント名とパラメータを送信可能
await logEvent('tutorial_complete', {
  tutorial_name: 'onboarding',
  duration_seconds: 120,
})
```

---

## 🔗 参考リンク

- [Firebase Analytics 公式ドキュメント](https://firebase.google.com/docs/analytics)
- [React Native Firebase - Analytics](https://rnfirebase.io/analytics/usage)
- [Expo + Firebase ガイド](https://docs.expo.dev/guides/using-firebase/)
- [Google Analytics イベントリファレンス](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
