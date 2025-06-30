import { ChatRoom } from '../models/chatRoom';
import {
  applyCreateChatRoomEventToChatRoom,
  CreateChatRoomEvent,
} from './createChatRoom';
import {
  applyPostMessageEventToChatRoom,
  PostChatMessageEvent,
} from './postChatMessage';

export type ChatRoomEvent = PostChatMessageEvent | CreateChatRoomEvent;

export function applyChatRoomEventToChatRoom(
  chatRoom: ChatRoom | null,
  event: ChatRoomEvent,
): ChatRoom {
  switch (event.type) {
    case 'CreateChatRoom': {
      return applyCreateChatRoomEventToChatRoom(chatRoom, event);
    }
    case 'PostMessage': {
      return applyPostMessageEventToChatRoom(chatRoom, event);
    }
    default:
      throw new Error(`Unknown event type: ${event}`);
  }
}
