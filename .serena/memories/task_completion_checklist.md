# タスク完了時のチェックリスト

## 必須チェック項目

### 1. コード品質チェック
```bash
# フォーマット確認・修正
npx biome format --write .

# リントチェック
npx biome lint .

# スペルチェック
npm run cspell
```

### 2. テスト実行
対象サービスのディレクトリで:
```bash
# Command サービス
cd backend/command && npm run test

# 他のサービスも必要に応じて
```

### 3. ビルド確認
各サービスでビルドエラーがないことを確認:
```bash
cd backend/command && npm run build
cd backend/query && npm run build  
cd backend/read-model-updater && npm run build
```

### 4. Git状態確認
```bash
git status
git diff
```

## コミット前の確認事項

- [ ] すべてのテストが通る
- [ ] ビルドエラーがない
- [ ] Biomeのフォーマット・リント規則に適合
- [ ] スペルチェックでエラーがない
- [ ] 変更内容が意図通り
- [ ] 不要なデバッグコードやコメントが残っていない

## エラー対応

### フォーマット・リントエラー
- Biome設定に従って自動修正: `npx biome format --write .`
- 手動修正が必要な項目は個別に対応

### テストエラー
- テスト失敗の原因を特定し修正
- 新機能追加の場合は適切なテストを追加

### ビルドエラー
- TypeScriptの型エラーを解決
- 依存関係やインポートパスの確認

### スペルエラー
- `cspell.json`の設定を確認
- 専門用語は辞書に追加を検討