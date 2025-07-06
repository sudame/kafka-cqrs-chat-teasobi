import { err, ok, Result } from 'neverthrow';

export type ChatRoomMessageId = {
  value: string;
};

export function newChatRoomMessageId(
  value: string,
): Result<ChatRoomMessageId, Error> {
  if (value === '') {
    return err(new Error('ChatRoomMessage ID cannot be an empty string.'));
  }

  const chatRoomMessageId: ChatRoomMessageId = { value };
  return ok(chatRoomMessageId);
}
