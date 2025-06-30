import { ulid } from 'ulid';
import { newChatRoomId } from '../models/chatRoom';
import { Kafka } from 'kafkajs';
import { CreateChatRoomCommand } from '../commands/createChatRoom';
import { CreateChatRoomEvent } from '../events/createChatRoom';

export async function handleCreateChatRoomCommand(
  command: CreateChatRoomCommand,
  deps: {
    kafka: Kafka;
  },
) {
  // TODO: validation

  const event: CreateChatRoomEvent = {
    type: 'CreateChatRoom',
    chatRoomId: newChatRoomId(),
    chatRoomName: command.chatRoomName,
    // FIXME: members に正しい値を入れる
    members: [
      {
        id: ulid(),
        userId: command.operatorUserId,
      },
    ],
    createdAt: Date.now(),
    newChatRoomVersion: 1,
  };

  const { kafka } = deps;

  const producer = kafka.producer();
  await producer.connect();

  producer.send({
    topic: 'chat-events',
    messages: [
      {
        key: event.chatRoomId,
        value: JSON.stringify(event),
      },
    ],
  });
}
