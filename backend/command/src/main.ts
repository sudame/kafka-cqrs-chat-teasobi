import { Kafka } from 'kafkajs';
import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { serve } from '@hono/node-server';
import { postMessageCommandSchema } from './domain/chatRoom/commands/postChatMessage';
import { handlePostMessageCommand } from './domain/chatRoom/commandHandlers/postChatMessage';
import { handleCreateUserCommand } from './domain/user/commands/createUser';
import { createChatRoomCommandSchema } from './domain/chatRoom/commands/createChatRoom';
import { handleCreateChatRoomCommand } from './domain/chatRoom/commandHandlers/createChatRoom';
import { createCreateUser } from './domain/user/useCases/createUser';
import { ok } from 'neverthrow';

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
    validator('json', async (command, c) => {
      const createUser = createCreateUser();
      const result = await handleCreateUserCommand(
        command,
        createUser,
        // TODO: 実装する
        async (_) => ok(),
      );
      if (result.isErr()) {
        return c.json(result.error, 400);
      }
      const event = result.value;
      return c.json(event, 200);
    }),
  );

serve({ ...app, port: 8081 }, (info) => {
  console.log(`Server is running at http://${info.address}:${info.port}`);
});
