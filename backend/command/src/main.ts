import { Kafka } from 'kafkajs';
import { ulid } from 'ulid';
import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { serve } from '@hono/node-server';
import { z } from 'zod/v4';
import { System } from './domain/system';
import { applyEventToSystem, SystemEvent } from './events';
import { PostChatMessageEvent } from './events/postChatMessage';

const app = new Hono();

const postMessageCommandSchema = z.object({
  chatRoomId: z.string(),
  authorUserId: z.string(),
  content: z.string().min(1, 'Content must not be empty'),
});

type PostMessageCommand = z.infer<typeof postMessageCommandSchema>;

const kafka = new Kafka({
  // TODO: 環境変数に置き換え
  brokers: ['kafka:29092'],
});

const producer = kafka.producer();

export const systemStore: { system: System | null } = {
  system: null,
};

async function startSystemEventConsumer() {
  const consumer = kafka.consumer({ groupId: 'chat-group' });
  await consumer.connect();
  await consumer.subscribe({ topic: 'chat-events', fromBeginning: true });

  const initialSystem: System = {
    rooms: {},
  };

  consumer.run({
    eachMessage: async ({ message }) => {
      if (message.value == null) {
        console.warn('Received message with no value, skipping');
        return;
      }
      const event: SystemEvent = JSON.parse(message.value.toString());

      const newSystem = applyEventToSystem(
        systemStore.system ?? initialSystem,
        event,
      );

      systemStore.system = newSystem;
    },
  });
}

startSystemEventConsumer().catch((error) => {
  console.error('Failed to start system event consumer:', error);
  process.exit(1);
});

export async function handlePostMessageCommand(command: PostMessageCommand) {
  const system = systemStore.system;
  if (system == null) {
    throw new Error('System is not initialized.');
  }
  const chatRoom = system.rooms[command.chatRoomId];

  if (chatRoom == null) {
    throw new Error('Chat room not found.');
  }

  if (
    !chatRoom.members.some((member) => member.userId === command.authorUserId)
  ) {
    throw new Error('User is not a member of the chat room.');
  }

  const now = Date.now();
  const event: PostChatMessageEvent = {
    type: 'PostMessage',
    chatRoomId: command.chatRoomId,
    chatMessage: {
      id: ulid(),
      postedAt: now,
      authorUserId: command.authorUserId,
      content: command.content,
    },
    createdAt: now,
  };

  await producer.connect();
  kafka.producer().send({
    topic: 'chat-events',
    messages: [
      {
        key: event.chatRoomId,
        value: JSON.stringify(event),
      },
    ],
  });
}

app.post(
  '/post-message',
  validator('json', async (value, c) => {
    const parsed = postMessageCommandSchema.safeParse(value);

    if (!parsed.success) {
      return c.json({ status: 'error', message: parsed.error.message }, 400);
    }

    const command: PostMessageCommand = parsed.data;

    try {
      await handlePostMessageCommand(command);
      return c.json({ status: 'success' });
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ status: 'error', message: error.message }, 400);
      }

      return c.json({ status: 'error', message: 'Unknown error' }, 500);
    }
  }),
);

serve(app, (info) => {
  console.log(`Server is running at http://${info.address}:${info.port}`);
});
