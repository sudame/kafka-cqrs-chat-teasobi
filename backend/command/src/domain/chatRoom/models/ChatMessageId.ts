import { err, ok, Result } from 'neverthrow';
import { ulid } from 'ulid';

export type ChatMessageId = {
  value: string;
};

export function newChatMessageId(value: string): Result<ChatMessageId, Error> {
  if (value === '') {
    return err(new Error('ChatRoomMessage ID cannot be an empty string.'));
  }

  const chatRoomMessageId: ChatMessageId = { value };
  return ok(chatRoomMessageId);
}

export function newChatMessageIdFromSafeValue(
  safeValue: string,
): ChatMessageId {
  return {
    value: safeValue,
  };
}

export function generateChatMessageId(
  uniqueIdGenerator?: () => string,
): Result<ChatMessageId, Error> {
  const uniquePart = uniqueIdGenerator ? uniqueIdGenerator() : ulid();
  const id = `chat-message-${uniquePart}`;
  return newChatMessageId(id);
}
