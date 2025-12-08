以下のリビルド手順をこのファイルで宣言した上で実行します（完了後にこのMDを退避→再配置します）:
1. `AGENTS.md` を一時退避先 `/Users/toshikimatsukuma/Documents/AGENTS.md.backup` にコピーする
2. `/Users/toshikimatsukuma/Documents/study/expo-template` を空にする（既存ファイルはAGENTS.md以外なしを確認済み）
3. `npx create-tamagui-app@latest . --template expo-router --typescript` を同ディレクトリで実行し、Tamagui + Expo Router + TypeScript テンプレを生成する
4. 生成完了後、退避した `AGENTS.md` を元の場所に戻す
5. ここからライブラリを1つずつインストールし、インストールごとに動作確認依頼を行う

導入するライブラリ一覧＋最適な導入手順

---

# 🧱 **まず前提：あなたがテンプレに入れると決めているライブラリ**

## 🟦 **UI / Navigation**

* **Tamagui**（UI）
* **react-native-gesture-handler**
* **react-native-reanimated**
* **expo-router**
* **react-native-safe-area-context**
* **react-native-screens**
* **expo-linking**
* **expo-constants**
* **expo-status-bar**

## 🟩 **State / Data / Auth**

* **React Hook Form**
* **TanStack Query**
* **Supabase JS**

## 🟨 **Native 基盤（新規追加分・必須級）**

* **@react-native-async-storage/async-storage**
* **expo-secure-store**
* **expo-device**
* **expo-font**
* **expo-splash-screen**
* **expo-haptics**
* **expo-image**
* **react-native-svg**

---

# 🔥 **最適な導入ルール（超重要）**

## ⭐ **テンプレート生成は "Tamagui テンプレ" 一択**

理由：

* tamagui の Babel / Metro 設定が最も壊れやすい → 初期状態で入っているほうが安全
* Expo Router は後付けでも安定して導入できる
* Reanimated も Tamagui テンプレでセットアップ済みのことが多い

---

# 🚀 **テンプレート環境の最適導入手順（完全版）**

以下の順で進めると、
依存が衝突せず **最小のストレスで最強テンプレが完成する**。

---

# ① プロジェクト生成（Tamagui + Expo Router）

```
npx create-tamagui-app@latest my-app --template expo-router
```

これで最も壊れやすい部分（Metro/Babel/Reanimated）が自動で設定される。

---

# ② Expo の標準 UI / Navigation 系（既に含まれる場合もあるので重複チェック）

```
npx expo install react-native-gesture-handler react-native-reanimated
npx expo install expo-router react-native-safe-area-context react-native-screens
npx expo install expo-linking expo-constants expo-status-bar
```

※ Tamagui テンプレによっては最初から入っていることもある

---

# ③ Supabase / State 管理 / フォーム

```
npm install @supabase/supabase-js
npm install @tanstack/react-query
npm install react-hook-form
npm install zod
```

これは純JSなので依存衝突しない。
テンプレに100%入れてOK。

---

# ④ Native 基盤（テンプレートに必須なインフラ層）

```
npx expo install @react-native-async-storage/async-storage
npx expo install expo-secure-store
npx expo install expo-device
npx expo install expo-font
npx expo install expo-splash-screen
npx expo install expo-haptics
npx expo install expo-image
npx expo install react-native-svg
```

これらは **すべて Expo 公式サポートライブラリ** なので安全。

---

# ⑤ Reanimated 設定確認（Tamagui + RN 環境で超重要）

package.json に以下があるか確認：

```json
"babel": {
  "plugins": [
    "react-native-reanimated/plugin"
  ]
}
```

そして **Babel plugin は必ず一番下** に置く。

---

# ⑥ Expo Router v3 設定確認

app/ ディレクトリが存在し、`app/_layout.tsx` があること。

追加で：

```
npx expo customize metro.config.js
```

して、Tamagui 用の transformer が正しく設定されているか確認する。

---

# ⑦ Tamagui config の整理（テーマとスケールを統合する）

あなたが言った：

> 5つのスケール＋コンポーネントの語彙だけ決める

これは **Tamagui config に集約する**。

例えば：

* color scale
* radius scale
* spacing scale
* typography scale
* size scale

これを
`tamagui.config.ts` にまとめて、
「複数アプリが同じデザインシステムを使う」状態を作る。

---

# ⑧ テスト起動 & サンプル画面作成

```
npx expo start
```

そして Tamagui + Expo Router + Supabase + Query の結合テストとして、
最小ユースケース画面をテンプレに含める：

* `app/index.tsx` → サンプルUI（Button, Input）
* `app/auth/login.tsx` → Supabase Authの例
* `app/example/query.tsx` → React Query の例

これをテンプレに最初から入れておくと、
次のアプリから一瞬で流用できる。

---

# 🌈 **最終テンプレート構成（あなた専用の黄金構成）**

```
my-app/
  app/
    _layout.tsx
    index.tsx
    auth/
      login.tsx
    example/
      query.tsx
  tamagui.config.ts
  constants/
    colors.ts
    spacing.ts
    typography.ts
  lib/
    supabase.ts
    queryClient.ts
  hooks/
    useAuth.ts
```

---

# 🧠 **これであなたの複数アプリ開発は圧倒的に効率化される**

* **UI / Navigation / 動作基盤が全て統一されたテンプレート**
* **React Hook Form ＋ Query ＋ Supabase のセットが一発で起動**
* **Tamagui と Reanimated の最難関部分がテンプレ化済み**
* **Expo SDK 更新時にも壊れにくい構成**
* **中級〜上級アプリもこの土台で全部作れる**
