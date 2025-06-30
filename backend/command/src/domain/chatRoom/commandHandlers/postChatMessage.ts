import { ulid } from 'ulid';
import { PostMessageCommand } from '../commands/postChatMessage';
import { canPostMessage } from '../models/chatRoom';
import { PostChatMessageEvent } from '../events/postChatMessage';
import { Kafka } from 'kafkajs';
import { rebuildChatRoom } from '.';

export async function handlePostMessageCommand(
  command: PostMessageCommand,
  deps: {
    kafka: Kafka;
  },
): Promise<void> {
  const existingChatRoom = await rebuildChatRoom(
    command.chatRoomId,
    deps.kafka,
  );

  console.log(existingChatRoom);

  const validation = canPostMessage({
    chatRoom: existingChatRoom,
    operatorUserId: command.authorUserId,
    messageContent: command.content,
  });

  if (validation.isErr()) {
    throw validation.error;
  }

  const chatRoom = validation.value;
  const newChatRoomVersion = chatRoom.version + 1;

  const now = Date.now();
  const event: PostChatMessageEvent = {
    type: 'PostMessage',
    newChatRoomVersion,
    chatRoomId: command.chatRoomId,
    chatMessage: {
      id: ulid(),
      postedAt: now,
      authorUserId: command.authorUserId,
      content: command.content,
    },
    createdAt: now,
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
