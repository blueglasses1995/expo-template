# Convex セットアップガイド

## 📦 インストール済みパッケージ

- `convex` - Convex クライアント/サーバー

## 🚀 初期セットアップ

### 1. Convex プロジェクトの作成

```bash
npx convex dev
```

初回実行時に:
- GitHub でログインを求められます
- 新しい Convex プロジェクトを作成
- `.env.local` が自動生成されます

### 2. 環境変数の設定

`.env.local` に以下を追加（`npx convex dev` で自動設定）:

```env
# Convex デプロイメント名
CONVEX_DEPLOYMENT=dev:your-project-123

# Expo アプリ用 URL
EXPO_PUBLIC_CONVEX_URL=https://your-project-123.convex.cloud
```

## 📝 使用方法

### Convex Query/Mutation の使用

```tsx
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'

function TaskList() {
  const tasks = useQuery(api.tasks.list)
  const createTask = useMutation(api.tasks.create)

  const handleAdd = () => {
    createTask({ text: '新しいタスク' })
  }

  return (
    <View>
      {tasks?.map((task) => (
        <Text key={task._id}>{task.text}</Text>
      ))}
      <Button onPress={handleAdd} title="追加" />
    </View>
  )
}
```

**ポイント**: `useQuery` のデータはリアルタイムで自動更新されます！

## 🔧 開発時のワークフロー

2つのターミナルを使用:

```bash
# ターミナル1: Convex バックエンド
npx convex dev

# ターミナル2: Expo アプリ
pnpm start
```

## 📁 ファイル構造

```
convex/
├── _generated/      # 自動生成（コミットしない）
├── convex.config.ts # Convex 設定
├── schema.ts        # データベーススキーマ
└── tasks.ts         # Query/Mutation の例

lib/
└── convex.ts        # Convex クライアント
```

## ⚠️ 注意事項

1. **`_generated` フォルダ**: `convex/_generated/` は `npx convex dev` 実行時に自動生成されます。初回実行前はエラーが出ることがあります

2. **認証について**: 現在は Supabase Auth を使用しています。Convex での認証が必要な場合は下記の「Better Auth について」を参照してください

## 🔗 参考リンク

- [Convex ドキュメント](https://docs.convex.dev/)
- [Convex React Native クイックスタート](https://docs.convex.dev/quickstart/react-native)

---

## 📋 Better Auth について（現在無効化中）

### 経緯

2024年12月時点で、`@convex-dev/better-auth` + `better-auth` を React Native / Expo で使用すると、以下のエラーが発生しました：

```
Unable to resolve "kysely" from "better-auth/dist/index.mjs"
```

**原因**: 
- `@convex-dev/better-auth/react` が `better-auth` のサーバーサイドコードをインポート
- `better-auth` が `kysely`（データベースライブラリ）に依存
- React Native ではサーバーサイドのモジュールをバンドルできない

**試したこと**:
1. `kysely` を明示的にインストール → 解決せず
2. `better-auth/client` を使用 → `@convex-dev/better-auth/react` 側で依存があり解決せず

**結論**:
`@convex-dev/better-auth` は現時点で React Native / Expo に対応していない可能性が高い。今後のアップデートで対応される可能性があるため、パッケージは `package.json` に残しています。

### 将来的に再度試す場合

1. `@convex-dev/better-auth` と `better-auth` のバージョンを確認
2. [Convex Better Auth Expo ガイド](https://convex-better-auth.netlify.app/framework-guides/expo) を確認
3. React Native 対応が明記されていれば再度導入を試みる

### 代替案

- **Supabase Auth**: このテンプレートに既に組み込み済み
- **Clerk**: Convex と統合可能な認証サービス
- **Convex Auth (公式)**: Convex 公式の認証ソリューション（別パッケージ）
