import { ChatMessage, ChatRoom } from '../models/chatRoom';

export interface PostChatMessageEvent {
  type: 'PostMessage';
  chatRoomId: string;
  chatMessage: ChatMessage;
  createdAt: number;
  newChatRoomVersion: number;
}

export function applyPostMessageEventToChatRoom(
  chatRoom: ChatRoom,
  event: PostChatMessageEvent,
): ChatRoom {
  if (chatRoom == null) {
    throw new Error('Chat room not found.');
  }

  const newMessages = chatRoom.messages.concat(event.chatMessage);
  const newChatRoom: ChatRoom = Object.assign({}, chatRoom, {
    messages: newMessages,
  });

  return newChatRoom;
}
