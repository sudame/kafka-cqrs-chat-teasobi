import { Result } from 'neverthrow';
import { ChatRoom } from '../models/chatRoom';
import {
  applyCreateChatRoomEventToChatRoom,
  ChatRoomCreatedEvent,
} from './chatRoomCreated';
import { Kafka } from 'kafkajs';
import {
  applyChatMessagePostedEventToChatRoom,
  ChatMessagePostedToChatRoomEvent,
} from './chatMessagePostedToChatRoom';

export type ChatRoomEvent =
  | ChatMessagePostedToChatRoomEvent
  | ChatRoomCreatedEvent;

export async function applyChatRoomEventToChatRoom(
  chatRoom: ChatRoom | null,
  event: ChatRoomEvent,
  deps: { kafka: Kafka },
): Promise<Result<ChatRoom, Error>> {
  switch (event.type) {
    case 'chat-room-created': {
      return applyCreateChatRoomEventToChatRoom(chatRoom, event, deps);
    }
    case 'chat-message-posted-to-chat-room': {
      return applyChatMessagePostedEventToChatRoom(chatRoom, event);
    }
    default:
      throw new Error(`Unknown event type: ${event}`);
  }
}
