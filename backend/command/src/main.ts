import { Kafka } from 'kafkajs';
import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { HTTPException } from 'hono/http-exception';
import { serve } from '@hono/node-server';
import { handlePostMessageCommand } from './domain/chatRoom/commands/postChatMessage';
import { handleCreateUserCommand } from './domain/user/commands/createUser';
import { handleCreateChatRoomCommand } from './domain/chatRoom/commands/createChatRoom';
import { createCreateUser } from './domain/user/useCases/createUser';
import { createSendMessageToKafka } from './tools/createSendMessageToKafka';
import { createPostChatMessageToChatRoom } from './domain/chatRoom/useCases/postChatMessageToChatRoom';

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

const sendMessageToKafka = createSendMessageToKafka(kafka);

app
  .post(
    '/create-chat-room',
    validator('json', async (value, c) => {
      const result = await handleCreateChatRoomCommand(
        value,
        sendMessageToKafka,
        { kafka },
      );
      if (result.isErr()) {
        throw new HTTPException(400, result.error);
      }
      const event = result.value;
      return c.json(event, 200);
    }),
  )
  .post(
    '/post-message',
    validator('json', async (command, c) => {
      const postChatMessageToChatRoom = createPostChatMessageToChatRoom();
      const result = await handlePostMessageCommand(
        command,
        postChatMessageToChatRoom,
        sendMessageToKafka,
        {
          kafka,
        },
      );
      if (result.isErr()) {
        throw new HTTPException(400, result.error);
      }
      const event = result.value;
      return c.json(event, 200);
    }),
  )
  .post(
    '/create-user',
    validator('json', async (command, c) => {
      const createUser = createCreateUser();
      const result = await handleCreateUserCommand(
        command,
        createUser,
        sendMessageToKafka,
      );
      if (result.isErr()) {
        throw new HTTPException(400, result.error);
      }
      const event = result.value;
      return c.json(event, 200);
    }),
  );

serve({ ...app, port: 8081 }, (info) => {
  console.log(`Server is running at http://${info.address}:${info.port}`);
});
