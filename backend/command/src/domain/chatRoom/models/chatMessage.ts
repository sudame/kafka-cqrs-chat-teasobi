import { err, ok, Result } from 'neverthrow';
import { User } from '../../user/models/user';
import { ChatMessageId } from './ChatMessageId';

export interface ChatMessage {
  id: ChatMessageId;
  postedAt: Date;
  authorUser: User;
  content: string;
}

export type CreateChatMessageArgs = ChatMessage;

export function createChatMessage(
  args: CreateChatMessageArgs,
): Result<ChatMessage, Error> {
  // メッセージの内容は空であってはならない
  if (args.content === '') {
    return err(new Error('Chat message content cannot be empty.'));
  }

  return ok({
    ...args,
  });
}
