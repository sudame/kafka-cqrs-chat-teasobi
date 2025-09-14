import { err, ok, type Result } from 'neverthrow';
import { isValid as isValidUlid, ulid } from 'ulid';

export type MessageId = string & { chatRoomMessageId: never };

export class MessageIdValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChatRoomMessageIdValidationError';
  }
}

export function generateMessageId(): MessageId {
  return `message-${ulid()}` as MessageId;
}

export function messageIdFromString(
  id: string,
): Result<MessageId, MessageIdValidationError> {
  if (!id.startsWith('message-')) {
    return err(
      new MessageIdValidationError(
        `ChatRoomMessageId must start with "message-", but got: "${id}"`,
      ),
    );
  }

  const ulidPart = id.slice('message-'.length);
  if (!isValidUlid(ulidPart)) {
    return err(
      new MessageIdValidationError(
        `ChatRoomMessageId must ends with ULID, but got: "${id}"`,
      ),
    );
  }

  return ok(id as MessageId);
}

export function messageIdToString(chatRoomMessageId: MessageId): string {
  return chatRoomMessageId as string;
}
