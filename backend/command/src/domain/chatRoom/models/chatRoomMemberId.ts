import { err, ok, Result } from 'neverthrow';

export type ChatRoomMemberId = {
  value: string;
};

export function newChatRoomMemberId(
  value: string,
): Result<ChatRoomMemberId, Error> {
  if (value === '') {
    return err(new Error('ChatRoomMember ID cannot be an empty string.'));
  }

  const chatRoomMemberId: ChatRoomMemberId = { value };
  return ok(chatRoomMemberId);
}

export function newChatRoomMemberIdFromSafeValue(
  safeValue: string,
): ChatRoomMemberId {
  return {
    value: safeValue,
  };
}

export function generateChatRoomMemberId(
  uniqueIdGenerator?: () => string,
): Result<ChatRoomMemberId, Error> {
  const uniquePart = uniqueIdGenerator ? uniqueIdGenerator() : '';
  const id = `chat-room-member-${uniquePart}`;
  return newChatRoomMemberId(id);
}
