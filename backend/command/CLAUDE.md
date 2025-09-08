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

# 型チェック
npx tsc

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

- **エンティティ**: `ChatRoomMember` - チャットルームメンバーを表現するドメインモデル
  - `memberId`: ChatRoomMemberId 値オブジェクト
  - `createChatRoomMember()`: ファクトリ関数による新規作成（ID は自動生成）

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
  - `ChatRoomMemberId`: チャットルームメンバー識別子
    - Branded Type パターンによる型安全性の確保
    - ULID を使用した一意な識別子の生成（`member-` プレフィックス付き）
    - メソッド: `generateChatRoomMemberId()`, `chatRoomMemberIdFromString()`, `chatRoomMemberIdToString()`

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
- **テストでの neverthrow 使用方法**:
  - 条件分岐（`if (result.isOk())`）を使わず、`_unsafeUnwrap()` メソッドを使用
  - エラーケースでは `_unsafeUnwrapErr()` メソッドを使用

### ビルド設定

- ESM モジュール形式
- Node.js プラットフォーム向け
- ソースマップ付きで minify 化

## 開発ベストプラクティス

### ドメインエンティティの設計原則

- **create[Entity] 関数の責務**: エンティティの生成時にIDを自動生成すべき。外部からIDを渡すべきではない
  - ✅ 正しい例: `createChatRoomMember()` - IDを内部で自動生成
  - ❌ 誤った例: `createChatRoomMember({ memberId })` - 外部からIDを受け取る

### ドメイン制約

- **ChatRoom**: 必ず1人以上のメンバーが必要。空のメンバーセットでの作成は `CreateChatRoomWithoutInitialMembersError` を返す

### 実装フロー

1. **既存実装の調査**: 類似機能がある場合は必ず参考にしてパターンを踏襲する
2. **段階的実装**: 値オブジェクト → エンティティ → テストの順序で、依存関係を意識した実装
3. **包括的テスト**: 正常系・異常系・境界値を網羅するテストケースを作成
4. **ファイル分割**: 関連する機能は独立したファイルとして作成し、モジュラリティを保つ