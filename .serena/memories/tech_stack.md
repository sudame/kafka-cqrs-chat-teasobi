# 技術スタック

## 開発言語・フレームワーク
- **TypeScript**: @tsconfig/strictest による厳格な型チェック
- **Hono**: 軽量Webフレームワーク
- **Node.js**: ESMモジュール形式

## エラーハンドリング・バリデーション
- **neverthrow**: Result型によるエラーハンドリング
- **Zod**: スキーマバリデーション

## テスト・ビルド・品質管理
- **Vitest**: テストフレームワーク
- **esbuild**: ビルドツール（ESM形式で出力、minify化、ソースマップ付き）
- **Biome**: フォーマッター・リンター
- **cspell**: スペルチェック

## 依存関係管理
- npm workspaces でモノレポ管理
- package.jsonにworkspacesを定義：
  - backend/command
  - backend/query 
  - backend/read-model-updater

## データベース・メッセージング
- **Apache Kafka**: イベントストア
- **TiDB**: 分散SQLデータベース（MySQL互換）
- **MySQL**: リードモデル用データベース
- **TiCDC**: Change Data Captureツール

## プラットフォーム・環境
- **Docker Compose**: サービス起動・管理
- **Darwin (macOS)**: 開発環境のOS