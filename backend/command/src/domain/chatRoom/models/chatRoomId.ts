import { err, ok, Result } from 'neverthrow';
import { ulid } from 'ulid';

export type ChatRoomId = {
  value: string;
};

export function newChatRoomId(value: string): Result<ChatRoomId, Error> {
  if (value === '') {
    return err(new Error('ChatRoom ID cannot be an empty string.'));
  }

  const chatRoomId: ChatRoomId = { value };
  return ok(chatRoomId);
}

export function newChatRoomIdFromSafeValue(safeValue: string): ChatRoomId {
  return {
    value: safeValue,
  };
}

export function generateChatRoomId(
  uniqueIdGenerator?: () => string,
): Result<ChatRoomId, Error> {
  const uniquePart = uniqueIdGenerator ? uniqueIdGenerator() : ulid();
  const id = `chat-room-${uniquePart}`;
  return newChatRoomId(id);
}
