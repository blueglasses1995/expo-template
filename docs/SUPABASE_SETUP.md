# Supabase セットアップガイド

このテンプレートでは Supabase を2つの方法で利用できます。

---

## 📋 目次

1. [クラウド版（推奨）](#1-クラウド版推奨)
2. [ローカル版（Docker）](#2-ローカル版docker)
3. [型の自動生成](#3-型の自動生成)
4. [認証機能の使い方](#4-認証機能の使い方)

---

## 1. クラウド版（推奨）

Docker 不要。最も簡単な方法です。

### 手順

#### Step 1: Supabase アカウント作成

1. https://supabase.com にアクセス
2. 「Start your project」をクリック
3. GitHub でサインイン

#### Step 2: プロジェクト作成

1. 「New project」をクリック
2. 以下を設定：
   - **Name**: プロジェクト名（例: `my-expo-app`）
   - **Database Password**: 強力なパスワードを設定（後で使うので保存）
   - **Region**: `Northeast Asia (Tokyo)` を選択
3. 「Create new project」をクリック
4. プロジェクト作成完了まで2分ほど待つ

#### Step 3: API キーの取得

1. プロジェクトダッシュボードで「Project Settings」（⚙️）をクリック
2. 左メニューから「API」を選択
3. 以下をコピー：
   - **Project URL**: `https://xxxx.supabase.co`
   - **anon public**: `eyJxxxx...`（Project API keys セクション）

#### Step 4: 環境変数の設定

プロジェクトルートに `.env.local` を作成：

```env
# Supabase クラウド版
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Step 5: アプリ起動

```bash
pnpm start
```

これで完了！認証機能がすぐに使えます。

---

## 2. ローカル版（Docker）

ローカルで Supabase を動かす方法。オフライン開発やマイグレーション管理に最適。

### 前提条件

- **Docker Desktop** がインストール済み
- Docker が起動している状態

### 手順

#### Step 1: Supabase CLI のインストール

```bash
# macOS
brew install supabase/tap/supabase

# npm（代替）
npm install -g supabase

# Windows (Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

#### Step 2: Supabase プロジェクトの初期化

```bash
# プロジェクトルートで実行
supabase init
```

これで `supabase/` ディレクトリが作成されます：

```
supabase/
├── config.toml      # Supabase 設定
├── migrations/      # データベースマイグレーション
└── seed.sql         # 初期データ
```

#### Step 3: ローカル Supabase の起動

```bash
supabase start
```

初回は Docker イメージのダウンロードで5〜10分かかります。

起動完了後、以下の情報が表示されます：

```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Step 4: 環境変数の設定

`.env.local` を作成：

```env
# Supabase ローカル版
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**注意**: anon key は `supabase start` の出力からコピーしてください。

#### Step 5: 開発開始

2つのターミナルを使用：

```bash
# ターミナル1: Supabase（Docker）
supabase start

# ターミナル2: Expo アプリ
pnpm start
```

### ローカル版の便利なコマンド

```bash
# 状態確認
supabase status

# 停止
supabase stop

# リセット（データベースを初期化）
supabase db reset

# マイグレーション作成
supabase migration new create_users_table

# マイグレーション適用
supabase db push

# Studio を開く（GUI でデータベース管理）
open http://127.0.0.1:54323
```

### ローカル版のサービス一覧

| サービス | URL | 説明 |
|---------|-----|------|
| API | http://127.0.0.1:54321 | REST / GraphQL API |
| Studio | http://127.0.0.1:54323 | GUI 管理画面 |
| Inbucket | http://127.0.0.1:54324 | メールテスト用 |
| PostgreSQL | localhost:54322 | データベース直接接続 |

---

## 3. 型の自動生成

Supabase のテーブル定義から TypeScript 型を自動生成できます。

### クラウド版の場合

```bash
# Supabase にログイン
npx supabase login

# 型を生成
npx supabase gen types typescript --project-id <project-id> > lib/database.types.ts
```

`<project-id>` は Supabase ダッシュボードの URL から取得：
`https://supabase.com/dashboard/project/<project-id>`

### ローカル版の場合

```bash
supabase gen types typescript --local > lib/database.types.ts
```

### 型の使用例

```typescript
// lib/supabase.ts
import type { Database } from './database.types'

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  // ...
)

// 使用例
const { data } = await supabase
  .from('users')  // 型補完が効く！
  .select('*')
```

---

## 4. 認証機能の使い方

このテンプレートには認証機能が組み込まれています。

### 利用可能な認証フック

```typescript
import { useAuth } from '@/hooks/useAuth'

function LoginScreen() {
  const {
    user,           // 現在のユーザー
    session,        // セッション情報
    loading,        // ローディング状態
    initialized,    // 初期化完了フラグ
    signInWithOtp,  // OTP（SMS/Email）ログイン
    verifyOtp,      // OTP 検証
    signInWithMagicLink,  // マジックリンク
    signInWithGoogle,     // Google ログイン
    signInWithApple,      // Apple ログイン
    signOut,        // ログアウト
  } = useAuth()

  // ...
}
```

### OTP（ワンタイムパスワード）ログインの例

```typescript
// 1. OTP を送信
await signInWithOtp({
  email: 'user@example.com',
})

// 2. ユーザーが入力した OTP を検証
await verifyOtp({
  email: 'user@example.com',
  token: '123456',
  type: 'email',
})
```

### マジックリンクの例

```typescript
await signInWithMagicLink('user@example.com')
// ユーザーのメールにログインリンクが届く
```

### ソーシャルログイン（要追加設定）

Supabase ダッシュボードで OAuth プロバイダーを設定後：

```typescript
await signInWithGoogle()
await signInWithApple()
```

---

## 📁 関連ファイル

```
lib/
└── supabase.ts        # Supabase クライアント

hooks/
└── useAuth.ts         # 認証フック

components/
└── AuthProvider.tsx   # 認証 Provider

app/
└── auth/
    └── callback.tsx   # OAuth コールバック
```

---

## 🔗 参考リンク

- [Supabase 公式ドキュメント](https://supabase.com/docs)
- [Supabase CLI リファレンス](https://supabase.com/docs/reference/cli)
- [Supabase + Expo ガイド](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [認証ガイド](https://supabase.com/docs/guides/auth)
