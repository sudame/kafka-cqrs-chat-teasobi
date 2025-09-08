import { err, ok, type Result } from 'neverthrow';
import { isValid as isValidUlid, ulid } from 'ulid';

export type ChatRoomId = string & { chatRoomId: never };

export class ChatRoomIdValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChatRoomIdValidationError';
  }
}

export function generate(): ChatRoomId {
  return `room-${ulid()}` as ChatRoomId;
}

export function fromString(
  id: string,
): Result<ChatRoomId, ChatRoomIdValidationError> {
  if (!id.startsWith('room-')) {
    return err(
      new ChatRoomIdValidationError(
        `ChatRoomId must start with "room-", but got: "${id}"`,
      ),
    );
  }

  const ulidPart = id.slice('room-'.length);
  if (!isValidUlid(ulidPart)) {
    return err(
      new ChatRoomIdValidationError(
        `ChatRoomId must ends with ULID, but got: "${id}"`,
      ),
    );
  }

  return ok(id as ChatRoomId);
}

export function asString(chatRoomId: ChatRoomId): string {
  return chatRoomId as string;
}
