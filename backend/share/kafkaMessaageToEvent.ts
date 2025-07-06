import { Message as KafkaMessage } from 'kafkajs';
import { err, ok, Result } from 'neverthrow';
import { ChatEvent } from './events';
import { assertNever } from './tools/assertNever';

export function kafkaMessageToEvent(
  message: KafkaMessage,
): Result<ChatEvent, Error> {
  let value: ChatEvent;
  if (message.value instanceof Buffer) {
    value = JSON.parse(message.value.toString());
  } else if (typeof message.value === 'string') {
    value = JSON.parse(message.value);
  } else {
    return err(new Error('Invalid message value type'));
  }

  const valueType = value.type;
  switch (valueType) {
    case 'chat-room-created':
      return ok(value);
    case 'user-created':
      return ok(value);
    case 'chat-message-posted-to-chat-room':
      return ok(value);
    default:
      assertNever(valueType);
      return err(new Error('Unknown event type: ' + valueType));
  }
}
