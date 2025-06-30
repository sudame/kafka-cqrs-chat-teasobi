import { Kafka } from 'kafkajs';
import { CreateUserCommand } from '../commands/createUser';
import { CreateUserEvent } from '../events/createUser';
import { newUserId } from '../models/user';

export async function handleCreateUserCommand(
  command: CreateUserCommand,
  deps: { kafka: Kafka },
): Promise<void> {
  const now = Date.now();

  const event: CreateUserEvent = {
    type: 'CreateUser',
    createdAt: now,
    newUserVersion: 1,
    userId: newUserId(),
    userName: command.userName,
  };

  const { kafka } = deps;
  const producer = kafka.producer();
  await producer.connect();

  await producer.send({
    topic: 'chat-events',
    messages: [
      {
        key: event.userId,
        value: JSON.stringify(event),
      },
    ],
  });
}
