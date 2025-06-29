import { ChatRoom } from '../models/chatRoom';
import { PostChatMessageEvent } from './postChatMessage';

export type ChatRoomEvent = PostChatMessageEvent;

export function applyChatRoomEventToChatRoom(
  chatRoom: ChatRoom,
  event: ChatRoomEvent,
): ChatRoom {
  switch (event.type) {
    case 'PostMessage': {
      const chatMessage = event.chatMessage;
      return {
        ...chatRoom,
        version: event.newChatRoomVersion,
        messages: [...chatRoom.messages, chatMessage],
      };
    }
    default:
      throw new Error(`Unknown event type: ${event.type}`);
  }
}
