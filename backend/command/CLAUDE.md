# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

CQRS (Command Query Responsibility Segregation) パターンに基づくチャットアプリケーションの Command サービス部分。モノレポ構造の一部として、backend/command ディレクトリに配置されている。

## 開発コマンド

```bash
# ビルド
npm run build

# テスト実行
npm run test

# コードフォーマット・リント（ルートディレクトリから実行）
cd ../.. && npx biome format --write . && npx biome lint .

# スペルチェック（ルートディレクトリから実行）
cd ../.. && npm run cspell
```

## アーキテクチャ概要

### ドメイン駆動設計

- **エンティティ**: `ChatRoom` - チャットルームを表現するドメインモデル
  - `id`: ChatRoomId 値オブジェクト
  - `name`: ChatRoomName 値オブジェクト
  - `createChatRoom()`: ファクトリ関数による新規作成

- **値オブジェクト**: ドメイン固有の型を使用
  - `ChatRoomId`: チャットルーム識別子
    - Branded Type パターン（`string & { chatRoomId: never }`）による型安全性の確保
    - ULID を使用した一意な識別子の生成（`room-` プレフィックス付き）
    - メソッド: `generateChatRoomId()`, `chatRoomIdFromString()`, `chatRoomIdAsString()`
  - `ChatRoomName`: チャットルーム名
    - 最大256文字の制限
    - 空文字列の禁止
    - `neverthrow` による Result 型を使った明示的なエラーハンドリング
    - メソッド: `chatRoomNameFromString()`, `chatRoomNameAsString()`

### 技術スタック

- **Hono**: 軽量な Web フレームワーク
- **neverthrow**: Result 型によるエラーハンドリング
- **Vitest**: テストフレームワーク
- **Biome**: フォーマッターとリンター
- **esbuild**: ビルドツール（ESM 形式で出力）

### コーディング規約

- TypeScript の `@tsconfig/strictest` を継承した厳格な型チェック
- インデント: スペース2つ
- クォート: シングルクォート
- Result 型を使用した明示的なエラーハンドリング
- 値オブジェクトには以下のパターンを使用:
  - `generate()`: 新規生成
  - `fromString()`: 文字列からの変換（Result 型を返す）
  - `asString()`: 文字列への変換

### ビルド設定

- ESM モジュール形式
- Node.js プラットフォーム向け
- ソースマップ付きで minify 化