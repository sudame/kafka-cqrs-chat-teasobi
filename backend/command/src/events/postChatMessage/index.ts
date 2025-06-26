import { ChatMessage, ChatRoom } from '../../domain/chatRoom';
import { System } from '../../domain/system';

export interface PostChatMessageEvent {
  type: 'PostMessage';
  chatRoomId: string;
  chatMessage: ChatMessage;
  createdAt: number;
}

export function applyPostMessageEventToSystem(
  system: System,
  event: PostChatMessageEvent,
): System {
  const newSystem = Object.assign({}, system);

  const chatRoom = newSystem.rooms[event.chatRoomId];

  if (chatRoom == null) {
    throw new Error('Chat room not found.');
  }

  const newMessages = chatRoom.messages.concat(event.chatMessage);
  const newChatRoom: ChatRoom = Object.assign({}, chatRoom, {
    messages: newMessages,
  });

  newSystem.rooms[event.chatRoomId] = newChatRoom;

  return newSystem;
}
