import { err, ok, type Result } from 'neverthrow';

export type ChatRoomName = string & { chatRoomName: never };

const MAX_LENGTH = 256;

export class ChatRoomNameValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChatRoomNameValidationError';
  }
}

export function chatRoomNameFromString(
  name: string,
): Result<ChatRoomName, ChatRoomNameValidationError> {
  if (name.length === 0) {
    return err(new ChatRoomNameValidationError('ChatRoomName cannot be empty'));
  }

  if (name.length > MAX_LENGTH) {
    return err(
      new ChatRoomNameValidationError(
        `ChatRoomName must be ${MAX_LENGTH} characters or less, but got ${name.length} characters`,
      ),
    );
  }

  return ok(name as ChatRoomName);
}

export function chatRoomNameAsString(chatRoomName: ChatRoomName): string {
  return chatRoomName as string;
}
