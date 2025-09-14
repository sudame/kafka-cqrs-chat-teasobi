import type { ChatRoomId } from '../chatRoom/chatRoomId';
import type { User } from '../user/user';
import type { MessageContent } from './messageContent';
import { generateMessageId, type MessageId } from './messageId';

export type Message = {
  id: MessageId;
  chatRoomId: ChatRoomId;
  author: User;
  content: MessageContent;
};

export type CreateMessageParam = {
  chatRoomId: ChatRoomId;
  author: User;
  content: MessageContent;
};

export function createMessage(params: CreateMessageParam): Message {
  const id = generateMessageId();
  return {
    id,
    chatRoomId: params.chatRoomId,
    author: params.author,
    content: params.content,
  };
}
