import { EventContract } from '@share/eventContract';
import { err, ok, Result } from 'neverthrow';

export type ChatRoomCreatedEvent = EventContract<{
  type: 'chat-room-created';
  chatRoom: {
    id: string;
    name: string;
    version: number;
    createdAt: number;
    members: {
      id: string;
      userId: string;
    }[];
  };
  createdAt: number;
  toVersion: number;
}>;

export function chatRoomCreatedEventToKafkaMessage(
  event: ChatRoomCreatedEvent,
): { key: string; value: string } {
  return {
    key: event.chatRoom.id,
    value: JSON.stringify(event),
  };
}

export function kafkaMessageToChatRoomCreatedEvent(
  value: string,
): Result<ChatRoomCreatedEvent, Error> {
  const event = JSON.parse(value) as ChatRoomCreatedEvent;
  if (event.type !== 'chat-room-created') {
    return err(new Error('Invalid event type'));
  }
  return ok(event);
}
