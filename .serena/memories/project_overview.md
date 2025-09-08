# プロジェクト概要

## 目的
CQRS (Command Query Responsibility Segregation) パターンに基づくチャットアプリケーション。Docker Compose でマイクロサービスを起動し、イベントソーシングとリードモデルの分離を実現。

## プロジェクト構造
- モノレポ構成（npm workspaces使用）
- 3つのマイクロサービス：
  - `backend/command` (ポート 8081): 書き込み処理、イベント発行
  - `backend/query` (ポート 8080): 読み取り専用API
  - `backend/read-model-updater` (ポート 8082): Kafkaイベント消費、リードモデル更新

## データストア・インフラ
- **Apache Kafka**: イベントストア (ポート 9092)
- **TiDB**: 分散SQLデータベース、MySQL互換 (ポート 4000)
  - TiCDC: Change Data Capture機能でKafkaに変更送信
- **MySQL**: リードモデル用データベース (ポート 3306)

## 開発ツール
- **Kafka UI**: http://localhost:8181
- **phpMyAdmin**: http://localhost:8180

## ドメイン駆動設計
- **値オブジェクト**: Branded Typeパターン（`string & { fieldName: never }`）
- **エンティティID**: ULIDベースでprefix付き（例: `room-01J5S3Y8...`）
- **エラーハンドリング**: `neverthrow`のResult型による明示的なエラー処理

## 主要な仕様
- ESMモジュール形式
- TypeScript `@tsconfig/strictest` 継承の厳格な型チェック
- 値オブジェクトメソッド命名規約：
  - `generate()`: 新規生成
  - `fromString()`: 文字列から変換（Result型を返す）
  - `toString()`または`asString()`: 文字列への変換