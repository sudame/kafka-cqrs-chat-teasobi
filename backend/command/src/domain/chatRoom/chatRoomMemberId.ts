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
  return `member-${ulid()}` as ChatRoomMemberId;
}

export function chatRoomMemberIdFromString(
  id: string,
): Result<ChatRoomMemberId, ChatRoomMemberIdValidationError> {
  if (!id.startsWith('member-')) {
    return err(
      new ChatRoomMemberIdValidationError(
        `ChatRoomMemberId must start with "member-", but got: "${id}"`,
      ),
    );
  }

  const ulidPart = id.slice('member-'.length);
  if (!isValidUlid(ulidPart)) {
    return err(
      new ChatRoomMemberIdValidationError(
        `ChatRoomMemberId must ends with ULID, but got: "${id}"`,
      ),
    );
  }

  return ok(id as ChatRoomMemberId);
}

export function chatRoomMemberIdToString(
  chatRoomMemberId: ChatRoomMemberId,
): string {
  return chatRoomMemberId as string;
}
