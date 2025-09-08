import { err, ok, type Result } from 'neverthrow';
import { isValid as isValidUlid, ulid } from 'ulid';

export type ChatRoomMemberId = string & { chatRoomMemberId: never };

export class ChatRoomMemberIdValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChatRoomMemberIdValidationError';
  }
}

export function generateChatRoomMemberId(): ChatRoomMemberId {
  return `chat-room-member-${ulid()}` as ChatRoomMemberId;
}

export function chatRoomMemberIdFromString(
  id: string,
): Result<ChatRoomMemberId, ChatRoomMemberIdValidationError> {
  if (!id.startsWith('chat-room-member-')) {
    return err(
      new ChatRoomMemberIdValidationError(
        `ChatRoomMemberId must start with "chat-room-member-", but got: "${id}"`,
      ),
    );
  }

  const ulidPart = id.slice('chat-room-member-'.length);
  if (!isValidUlid(ulidPart)) {
    return err(
      new ChatRoomMemberIdValidationError(
        `ChatRoomMemberId must ends with ULID, but got: "${id}"`,
      ),
    );
  }

  return ok(id as ChatRoomMemberId);
}

export function chatRoomMemberIdToString(chatRoomMemberId: ChatRoomMemberId): string {
  return chatRoomMemberId as string;
}