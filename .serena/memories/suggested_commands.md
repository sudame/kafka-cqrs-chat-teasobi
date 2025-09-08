# 推奨コマンド

## プロジェクト全体の操作

### 環境起動・停止
```bash
# Docker Compose でサービス起動
docker-compose up -d

# サービス停止
docker-compose down
```

### コード品質チェック・修正
```bash
# スペルチェック
npm run cspell

# コードフォーマット（修正）
npx biome format --write .

# リント（検査）
npx biome lint .

# フォーマット + リント（一括実行）
npx biome format --write . && npx biome lint .
```

## サービス別操作

### Command サービス (backend/command)
```bash
cd backend/command

# ビルド
npm run build

# テスト実行
npm run test

# ルートディレクトリからのフォーマット・リント
cd ../.. && npx biome format --write . && npx biome lint .
```

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

## ユーティリティコマンド（Darwin/macOS）
- `ls`: ファイル・ディレクトリ一覧
- `cd`: ディレクトリ移動
- `grep` または `rg` (ripgrep): テキスト検索
- `find`: ファイル検索
- `git`: バージョン管理
- `docker` / `docker-compose`: コンテナ管理

## タスク完了時のチェックリスト
1. コードフォーマット: `npx biome format --write .`
2. リント: `npx biome lint .`
3. スペルチェック: `npm run cspell`
4. 関連サービスのテスト実行
5. ビルド確認