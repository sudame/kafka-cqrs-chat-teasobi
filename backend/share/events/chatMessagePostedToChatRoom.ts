import { err, ok, Result } from 'neverthrow';

export interface ChatMessagePostedToChatRoomEvent {
  type: 'chat-message-posted-to-chat-room';
  chatRoomId: string;
  chatMessage: {
    id: string;
    postedAt: number;
    authorUserId: string;
    content: string;
  };
  createdAt: number;
  toVersion: number;
}

export function chatMessagePostedToChatRoomEventToKafkaMessage(
  event: ChatMessagePostedToChatRoomEvent,
): { key: string; value: string } {
  return {
    key: event.chatRoomId,
    value: JSON.stringify(event),
  };
}

export function kafkaMessageToChatMessagePostedToChatRoomEvent(
  value: string,
): Result<ChatMessagePostedToChatRoomEvent, Error> {
  const event = JSON.parse(value) as ChatMessagePostedToChatRoomEvent;
  if (event.type !== 'chat-message-posted-to-chat-room') {
    return err(new Error('Invalid event type'));
  }
  return ok(event);
}
