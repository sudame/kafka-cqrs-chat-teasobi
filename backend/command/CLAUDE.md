# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## コマンドサービス概要

このサービスは CQRS パターンの書き込み側を実装しており、チャットメッセージの投稿コマンドを処理してドメインイベントを生成します。Event Sourcing パターンを使用して、Kafka から集約の状態を再構築します。

## 開発コマンド

### ビルド
```bash
npm run build
# または直接実行
npx tsx build.ts
```

### Docker イメージのビルド
```bash
docker build -t command-service .
```

### ローカル実行（Docker Compose 経由）
```bash
# プロジェクトルートから
docker-compose up command
```

## アーキテクチャ設計

### イベントソーシングフロー
1. **コマンド受信**: `/post-message` エンドポイントでコマンドを受け付け
2. **集約の再構築**: `rebuildDomainObject` で Kafka から全イベントを取得して現在の状態を復元
3. **ビジネスルール検証**: ドメインモデルでメンバーシップやメッセージの妥当性を検証
4. **イベント生成**: コマンドハンドラーがドメインイベントを生成
5. **イベント発行**: Kafka の `chat-events` トピックにイベントを発行

### ドメイン構造
- `domain/chatRoom/models/`: ChatRoom 集約（メンバー、メッセージ、バージョン管理）
- `domain/chatRoom/commands/`: コマンド定義（Zod スキーマ付き）
- `domain/chatRoom/events/`: ドメインイベント定義
- `domain/chatRoom/commandHandlers/`: コマンド処理ロジック

### 重要な実装詳細

#### バージョン管理
- 各集約はバージョン番号を持ち、楽観的並行性制御を実現
- イベント発行時にバージョンをインクリメント
- Kafka オフセットも追跡して一貫性を保証

#### エラーハンドリング
- `neverthrow` の Result 型で明示的なエラー処理
- ドメインエラー（メンバーでない、空メッセージ）を適切に返却

#### Kafka 統合
- パーティションキーに chatRoomId を使用して集約の一貫性を保証
- 再構築時は一時的なコンシューマーグループを作成
- 現在は Kafka ブローカーアドレスがハードコード（TODO: 環境変数化）

### 開発時の注意点

1. **イベントソーシング**: 新しいイベントタイプを追加する際は、`rebuildDomainObject` の適用ロジックも更新が必要
2. **集約の境界**: ChatRoom が集約ルートとして、すべての状態変更を管理
3. **非同期処理**: 現在 Kafka への発行エラーは処理していないため、本番環境では改善が必要
4. **認証・認可**: 現在は実装されていないため、メンバーシップチェックのみに依存