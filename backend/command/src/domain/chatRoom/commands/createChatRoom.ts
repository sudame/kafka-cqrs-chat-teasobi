import z from 'zod/v4';
import { createCreateChatRoom } from '../useCases/createChatRoom';
import { err, ok, Result } from 'neverthrow';
import { Kafka } from 'kafkajs';
import { SendMessageToKafka } from '../../user/commands/createUser';
import {
  ChatRoomCreatedEvent,
  chatRoomCreatedEventToKafkaMessage,
} from '../../../../../share/events/chatRoomCreated';

export const createChatRoomCommandSchema = z.object({
  chatRoomName: z.string(),
  chatRoomMemberIds: z.array(z.string()),
  operatorUserId: z.string(),
});

export type CreateChatRoomCommand = z.infer<typeof createChatRoomCommandSchema>;

export async function handleCreateChatRoomCommand(
  command: CreateChatRoomCommand,
  sendMessageToKafka: SendMessageToKafka,
  deps: { kafka: Kafka },
): Promise<Result<ChatRoomCreatedEvent, Error>> {
  const commandParseResult = createChatRoomCommandSchema.safeParse(command);
  if (!commandParseResult.success) {
    return err(
      new Error('Invalid command format: ' + commandParseResult.error.message),
    );
  }
  const parsedCommand = commandParseResult.data;

  const createChatRoomUseCase = createCreateChatRoom(deps);
  const createChatRoomResult = await createChatRoomUseCase({
    chatRoomName: parsedCommand.chatRoomName,
    creatorUserId: parsedCommand.operatorUserId,
  });
  if (createChatRoomResult.isErr()) {
    return err(createChatRoomResult.error);
  }

  const { event } = createChatRoomResult.value;
  const kafkaMessage = chatRoomCreatedEventToKafkaMessage(event);
  const sendMessageResult = await sendMessageToKafka(kafkaMessage);
  if (sendMessageResult.isErr()) {
    return err(sendMessageResult.error);
  }

  return ok(event);
}
