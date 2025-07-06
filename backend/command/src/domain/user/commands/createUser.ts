import z from 'zod/v4';
import { CreateUser } from '../useCases/createUser';
import { err, ok, Result } from 'neverthrow';
import { Message as KafkaMessage } from 'kafkajs';
import {
  UserCreatedEvent,
  userCreatedEventToKafkaMessage,
} from '../events/userCreated';

export const createUserCommandSchema = z.object({
  userName: z.string(),
});

export type CreateUserCommand = z.infer<typeof createUserCommandSchema>;

// TODO: 適切な箇所に再配置
export type SendMessageToKafka = (
  event: KafkaMessage,
) => Promise<Result<void, Error>>;

export async function handleCreateUserCommand(
  command: CreateUserCommand,
  createUser: CreateUser,
  sendMessageToKafka: SendMessageToKafka,
): Promise<Result<UserCreatedEvent, Error>> {
  const commandParseResult = createUserCommandSchema.safeParse(command);
  if (!commandParseResult.success) {
    return err(
      new Error('Invalid command format: ' + commandParseResult.error.message),
    );
  }
  const parsedCommand = commandParseResult.data;

  const createUserResult = createUser({
    userName: parsedCommand.userName,
  });

  if (createUserResult.isErr()) {
    return err(createUserResult.error);
  }

  const { event } = createUserResult.value;

  const kafkaMessage = userCreatedEventToKafkaMessage(event);

  const storeEventResult = await sendMessageToKafka(kafkaMessage);
  if (storeEventResult.isErr()) {
    return err(storeEventResult.error);
  }

  return ok(event);
}
