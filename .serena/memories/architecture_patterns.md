# アーキテクチャパターン・設計指針

## CQRS（Command Query Responsibility Segregation）
- **Command側**: 書き込み処理、ドメインロジック、イベント発行
- **Query側**: 読み取り専用、最適化されたリードモデル
- **分離の利点**: パフォーマンス最適化、スケーリング独立性

## イベントソーシング
- イベントをKafkaに永続化
- 状態変更はイベントの再生により復元可能
- Read Model Updatorがイベントからリードモデルを構築

## ドメイン駆動設計（DDD）パターン

### エンティティ
```typescript
// ChatRoomエンティティの例
interface ChatRoom {
  id: ChatRoomId;
  name: ChatRoomName;
}
```

### 値オブジェクト
```typescript
// Branded Typeパターン
type ChatRoomId = string & { chatRoomId: never };
type ChatRoomName = string & { chatRoomName: never };

// ファクトリ関数
const generateChatRoomId = (): ChatRoomId => { /* ... */ }
const chatRoomIdFromString = (value: string): Result<ChatRoomId, Error> => { /* ... */ }
```

### Repository パターン
- データアクセスの抽象化
- ドメイン層とインフラ層の分離

## エラーハンドリングパターン
```typescript
import { Result, ok, err } from 'neverthrow';

// 明示的なエラーハンドリング
const validateName = (name: string): Result<ChatRoomName, ValidationError> => {
  if (name.length === 0) return err(new ValidationError('名前は必須です'));
  if (name.length > 256) return err(new ValidationError('名前は256文字以下で入力してください'));
  return ok(name as ChatRoomName);
};
```

## マイクロサービスの責務

### Command Service
- ドメインロジックの実行
- イベントの生成・発行
- TiDBへの状態永続化

### Query Service  
- リードモデルからの検索・取得
- 最適化されたクエリ実行
- API応答の最適化

### Read Model Updater
- Kafkaイベントの消費
- リードモデルの構築・更新
- 投影処理の実行