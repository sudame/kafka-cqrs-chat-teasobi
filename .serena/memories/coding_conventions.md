# コーディング規約

## TypeScript設定
- `@tsconfig/strictest` を継承した厳格な型チェック
- ESMモジュール形式
- `moduleResolution: "bundler"`
- `target: "esnext"`
- パス設定: `@share/*` → `./backend/share/*`

## コードフォーマット（Biome設定）
- **インデント**: スペース2つ (`indentWidth: 2`)
- **クォート**: シングルクォート (`quoteStyle: "single"`)
- **改行**: 推奨設定を使用
- **インポート**: 自動整理が有効 (`organizeImports: "on"`)

## 値オブジェクトの命名規約
- `generate()`: 新規生成（静的メソッド）
- `fromString()`: 文字列から変換、Result型を返す（静的メソッド）
- `toString()` または `asString()`: 文字列への変換（インスタンスメソッド）

## Branded Typeパターン
```typescript
type ChatRoomId = string & { chatRoomId: never }
```
型安全性確保のため、プリミティブ型にブランドを付与

## エラーハンドリング
- `neverthrow` の Result型を使用
- 例外ではなく明示的なエラー処理を推奨
- `ok()` と `err()` による結果の表現

## エンティティID規約
- ULIDベースの一意識別子
- プレフィックス付き（例: `room-01J5S3Y8...`）
- Branded Typeパターンで型安全性確保

## テスト
- Vitestを使用
- `.test.ts` ファイル名規約
- ドメインロジックの単体テストを重視