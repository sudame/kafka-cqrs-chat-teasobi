import { Kafka } from 'kafkajs';
import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { serve } from '@hono/node-server';
import { postMessageCommandSchema } from './domain/chatRoom/commands/postChatMessage';
import { handlePostMessageCommand } from './domain/chatRoom/commandHandlers/postChatMessage';

const app = new Hono();

const kafka = new Kafka({
  // TODO: 環境変数に置き換え
  brokers: ['kafka:29092'],
});

app.post(
  '/post-message',
  validator('json', async (value, c) => {
    const parsedCommand = postMessageCommandSchema.safeParse(value);
    if (!parsedCommand.success) {
      return c.json(
        { status: 'error', message: parsedCommand.error.message },
        400,
      );
    }

    const command = parsedCommand.data;
    await handlePostMessageCommand(command, { kafka });
    return c.json({ status: 'success' });
  }),
);

serve(app, (info) => {
  console.log(`Server is running at http://${info.address}:${info.port}`);
});
