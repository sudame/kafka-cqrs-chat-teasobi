import { Kafka } from 'kafkajs';
import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { serve } from '@hono/node-server';
import { postMessageCommandSchema } from './domain/chatRoom/commands/postChatMessage';
import { handlePostMessageCommand } from './domain/chatRoom/commandHandlers/postChatMessage';
import { createUserCommandSchema } from './domain/user/commands/createUser';
import { handleCreateUserCommand } from './domain/user/commandHandlers/createUser';
import { createChatRoomCommandSchema } from './domain/chatRoom/commands/createChatRoom';
import { handleCreateChatRoomCommand } from './domain/chatRoom/commandHandlers/createChatRoom';

const app = new Hono();

const kafka = new Kafka({
  // TODO: 環境変数に置き換え
  brokers: ['kafka:29092'],
});

const admin = kafka.admin();
await admin.connect();

const { topics } = await admin.fetchTopicMetadata();
if (topics.find((topic) => topic.name === 'chat-events') == null) {
  await admin.createTopics({
    topics: [
      {
        topic: 'chat-events',
        numPartitions: 3,
        replicationFactor: 1,
      },
    ],
  });
}
admin.disconnect();

app
  .post(
    '/create-chat-room',
    validator('json', async (value, c) => {
      const parsedCommand = createChatRoomCommandSchema.safeParse(value);
      if (!parsedCommand.success) {
        return c.text(parsedCommand.error.message, 400);
      }

      const command = parsedCommand.data;
      try {
        await handleCreateChatRoomCommand(command, { kafka });
      } catch (error) {
        console.error(error);
        if (error instanceof Error) {
          return c.json(error, 500);
        }
        return c.text(`Internal server error: ${error}`, 500);
      }
      return c.json({ status: 'success' });
    }),
  )
  .post(
    '/post-message',
    validator('json', async (value, c) => {
      const parsedCommand = postMessageCommandSchema.safeParse(value);
      if (!parsedCommand.success) {
        return c.text(parsedCommand.error.message, 400);
      }

      const command = parsedCommand.data;
      try {
        await handlePostMessageCommand(command, { kafka });
      } catch (error) {
        console.error(error);
        if (error instanceof Error) {
          return c.json(error, 500);
        }
        return c.text(`Internal server error: ${error}`, 500);
      }
      return c.json({ status: 'success' });
    }),
  )
  .post(
    '/create-user',
    validator('json', async (value, c) => {
      const parsedCommand = createUserCommandSchema.safeParse(value);
      if (!parsedCommand.success) {
        return c.text(parsedCommand.error.message, 400);
      }

      const command = parsedCommand.data;
      try {
        await handleCreateUserCommand(command, { kafka });
      } catch (error) {
        console.error(error);
        if (error instanceof Error) {
          return c.json(error, 500);
        }
        return c.text(`Internal server error: ${error}`, 500);
      }

      return c.json({ status: 'success' });
    }),
  );

serve({ ...app, port: 8081 }, (info) => {
  console.log(`Server is running at http://${info.address}:${info.port}`);
});
