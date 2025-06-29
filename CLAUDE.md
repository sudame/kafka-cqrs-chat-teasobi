# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

このプロジェクトは、Kafka を使用した CQRS (Command Query Responsibility Segregation) パターンに基づくチャットアプリケーション「kafka-cqrs-chat-teasobi」です。イベント駆動型のマイクロサービスアーキテクチャで構成されています。

## 開発コマンド

### インフラストラクチャの起動
```bash
# 全サービスの起動（Kafka、MySQL、各マイクロサービス）
docker-compose up

# バックグラウンドで起動
docker-compose up -d
```

### ビルドコマンド
```bash
# コマンドサービスのビルド
npm -w backend/command run build

# クエリサービスのビルド
npm -w backend/query run build

# Read Model Updaterのビルド
npm -w backend/read-model-updater run build
```

### コード品質チェック
```bash
# スペルチェック
npm run cspell
```

### 公開ポート
- Command API: http://localhost:8081
- Query API: http://localhost:8080
- Read Model Updater: http://localhost:8082
- Kafka UI: http://localhost:8181
- PHPMyAdmin: http://localhost:8180

## アーキテクチャ構造

### CQRS パターンの実装
1. **Command Service** (`backend/command/`): 書き込み操作を処理
   - コマンドハンドラーでビジネスロジックを実装
   - ドメインイベントを生成して Kafka に発行
   - 現在は ChatRoom ドメインのみ実装

2. **Query Service** (`backend/query/`): 読み取り操作を処理（現在は骨組みのみ）

3. **Read Model Updater** (`backend/read-model-updater/`): イベントから読み取りモデルを更新（未実装）

### ドメイン駆動設計
- `backend/command/src/domain/`: ドメインロジックを格納
- 各ドメインは commands、events、models、commandHandlers に分離
- ULID を使用してドメインオブジェクト ID を生成

### 技術スタック
- TypeScript（strict モード）
- Hono（軽量 Web フレームワーク）
- KafkaJS（Kafka クライアント）
- MySQL 9.3.0
- Zod（スキーマバリデーション）
- NeverThrow（エラーハンドリング）

### 開発時の注意点
- monorepo 構造（npm workspaces）を使用
- 各サービスは独立した package.json を持つ
- TypeScript の設定は @tsconfig/strictest を継承
- 現在テストフレームワークは未実装