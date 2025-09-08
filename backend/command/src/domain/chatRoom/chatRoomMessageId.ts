import { err, ok, type Result } from 'neverthrow';
import { isValid as isValidUlid, ulid } from 'ulid';

export type ChatRoomMessageId = string & { chatRoomMessageId: never };

export class ChatRoomMessageIdValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChatRoomMessageIdValidationError';
  }
}

export function generateChatRoomMessageId(): ChatRoomMessageId {
  return `message-${ulid()}` as ChatRoomMessageId;
}

export function chatRoomMessageIdFromString(
  id: string,
): Result<ChatRoomMessageId, ChatRoomMessageIdValidationError> {
  if (!id.startsWith('message-')) {
    return err(
      new ChatRoomMessageIdValidationError(
        `ChatRoomMessageId must start with "message-", but got: "${id}"`,
      ),
    );
  }

  const ulidPart = id.slice('message-'.length);
  if (!isValidUlid(ulidPart)) {
    return err(
      new ChatRoomMessageIdValidationError(
        `ChatRoomMessageId must ends with ULID, but got: "${id}"`,
      ),
    );
  }

  return ok(id as ChatRoomMessageId);
}

export function chatRoomMessageIdToString(chatRoomMessageId: ChatRoomMessageId): string {
  return chatRoomMessageId as string;
}