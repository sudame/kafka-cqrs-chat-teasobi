import type { ChatRoomMember } from './chatRoomMember';
import type { ChatRoomMessageContent } from './chatRoomMessageContent';
import {
  type ChatRoomMessageId,
  generateChatRoomMessageId,
} from './chatRoomMessageId';

export type ChatRoomMessage = {
  id: ChatRoomMessageId;
  author: ChatRoomMember;
  content: ChatRoomMessageContent;
};

export type CreateChatRoomMessageParams = {
  author: ChatRoomMember;
  content: ChatRoomMessageContent;
};

export function createChatRoomMessage(
  params: CreateChatRoomMessageParams,
): ChatRoomMessage {
  const id = generateChatRoomMessageId();
  return { id, author: params.author, content: params.content };
}