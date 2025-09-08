# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

CQRS (Command Query Responsibility Segregation) パターンに基づくチャットアプリケーション。Docker Compose でマイクロサービスを起動し、イベントソーシングとリードモデルの分離を実現。

## 開発コマンド

### プロジェクト全体

```bash
# Docker Compose でサービス起動
docker-compose up -d

# スペルチェック
npm run cspell

# コードフォーマット・リント
npx biome format --write .
npx biome lint .
```

### Command サービス (backend/command)

詳細は `backend/command/CLAUDE.md` を参照。

### Query サービス (backend/query)

```bash
cd backend/query

# ビルド
npm run build
```

### Read Model Updater (backend/read-model-updater)

```bash
cd backend/read-model-updater

# ビルド  
npm run build
```

## アーキテクチャ

### システム構成

- **Command サービス** (ポート 8081): 書き込み処理を担当、イベントを Kafka に発行
- **Query サービス** (ポート 8080): 読み取り専用 API を提供
- **Read Model Updater** (ポート 8082): Kafka のイベントを消費してリードモデルを更新

### データストア

- **Apache Kafka**: イベントストア (ポート 9092)
- **TiDB**: 分散 SQL データベース (MySQL 互換、ポート 4000)
  - TiCDC: Change Data Capture で変更を Kafka に送信
- **MySQL**: リードモデル用データベース (ポート 3306)

### 開発ツール

- **Kafka UI**: http://localhost:8181
- **phpMyAdmin**: http://localhost:8180

### ドメイン駆動設計

- **値オブジェクト**: Branded Type パターン (`string & { fieldName: never }`)
- **エンティティ ID**: ULID ベースで prefix 付き (例: `room-01J5S3Y8...`)
- **エラーハンドリング**: `neverthrow` の Result 型による明示的なエラー処理

### コーディング規約

- TypeScript `@tsconfig/strictest` による厳格な型チェック
- ESM モジュール形式
- Biome によるフォーマット:
  - インデント: スペース 2
  - クォート: シングルクォート
- 値オブジェクトのメソッド命名:
  - `generate()`: 新規生成
  - `fromString()`: 文字列から変換 (Result 型を返す)  
  - `toString()` または `asString()`: 文字列への変換

### 技術スタック

- **Hono**: 軽量 Web フレームワーク
- **neverthrow**: Result 型エラーハンドリング
- **Vitest**: テストフレームワーク
- **esbuild**: ビルドツール
- **Biome**: フォーマッター・リンター
- **Zod**: スキーマバリデーション