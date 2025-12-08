# Expo Tamagui Starter

Expo SDK 54 / Tamagui ベースの個人用テンプレートです。毎回の初期セットアップを省き、複数アプリで使い回すための土台として構築しています。

## 含めている主なライブラリ
- Tamagui (UI) / Expo Router / Reanimated / Gesture Handler / Safe Area / Screens
- Expo 標準系: constants, status-bar, linking, image, device, font, splash-screen, haptics, secure-store, async-storage
- State / Data: React Hook Form, TanStack Query, Supabase JS, Zod
- その他: react-native-svg, Shopify Skia、EAS CLI

## サンプル実装
- タブ画面で Gesture/Storage/SecureStore/Query/Form/Skia の簡易デモを用意
- Tamagui + Expo Router での画面構成と SafeArea/Stack レイアウトの設定済み

## 使い方
1. `pnpm install`
2. `pnpm start` で Expo を起動
3. `git commit` 時に Biome (lint/format) が自動で走ります

このリポジトリを複数アプリのスタート地点としてコピーし、Supabase 接続情報や UI テーマを差し替えて利用する想定です。
note because this is in a monorepo had to remove react, react-dom, and react-native-web deps and change metro.config.js a bit.
