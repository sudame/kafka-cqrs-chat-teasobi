import { Result } from 'neverthrow';
import { ChatRoom } from '../models/chatRoom';
import {
  applyCreateChatRoomEventToChatRoom,
  ChatRoomCreatedEvent,
} from './chatRoomCreated';
import { PostChatMessageEvent } from './postChatMessage';
import { Kafka } from 'kafkajs';

export type ChatRoomEvent = PostChatMessageEvent | ChatRoomCreatedEvent;

export async function applyChatRoomEventToChatRoom(
  chatRoom: ChatRoom | null,
  event: ChatRoomEvent,
  deps: { kafka: Kafka },
): Promise<Result<ChatRoom, Error>> {
  switch (event.type) {
    case 'chat-room-created': {
      return applyCreateChatRoomEventToChatRoom(chatRoom, event, deps);
    }
    default:
      throw new Error(`Unknown event type: ${event}`);
  }
}
