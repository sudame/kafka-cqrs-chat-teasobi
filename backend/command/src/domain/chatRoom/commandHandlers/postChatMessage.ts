import { ulid } from 'ulid';
import { PostMessageCommand } from '../commands/postChatMessage';
import { canPostMessage, ChatRoom, newChatRoom } from '../models/chatRoom';
import { PostChatMessageEvent } from '../events/postChatMessage';
import { Kafka } from 'kafkajs';
import { DomainObjectId } from '../../../core/domainObjectId';
import { ChatRoomEvent, applyChatRoomEventToChatRoom } from '../events';
import { rebuildDomainObject } from '../../../tools/rebuildDomainObject';

const rebuildChatRoom = (chatRoomId: DomainObjectId, kafka: Kafka) =>
  rebuildDomainObject<ChatRoom, ChatRoomEvent>({
    kafka,
    domainObjectId: chatRoomId,
    initialDomainObject: newChatRoom(chatRoomId),
    applyFunction: applyChatRoomEventToChatRoom,
  });

export async function handlePostMessageCommand(
  command: PostMessageCommand,
  deps: {
    kafka: Kafka;
  },
) {
  const validation = canPostMessage({
    chatRoom: await rebuildChatRoom(command.chatRoomId, deps.kafka),
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
