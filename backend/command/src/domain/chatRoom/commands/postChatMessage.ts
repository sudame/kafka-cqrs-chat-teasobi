import z from 'zod/v4';
import { PostChatMessageToChatRoom } from '../useCases/postChatMessageToChatRoom';
import { Kafka } from 'kafkajs';
import { err, ok, Result } from 'neverthrow';
import {
  ChatMessagePostedToChatRoomEvent,
  chatMessagePostedToChatRoomEventToKafkaMessage,
} from '../../../../../share/events/chatMessagePostedToChatRoom';
import { SendMessageToKafka } from '../../user/commands/createUser';

export const postMessageCommandSchema = z.object({
  chatRoomId: z.string(),
  authorUserId: z.string(),
  content: z.string().min(1, 'Content must not be empty'),
});

export type PostMessageCommand = z.infer<typeof postMessageCommandSchema>;

export async function handlePostMessageCommand(
  command: PostMessageCommand,
  postChatMessageToChatRoom: PostChatMessageToChatRoom,
  sendMessageToKafka: SendMessageToKafka,
  deps: {
    kafka: Kafka;
  },
): Promise<Result<ChatMessagePostedToChatRoomEvent, Error>> {
  const commandParseResult = postMessageCommandSchema.safeParse(command);
  if (!commandParseResult.success) {
    return err(
      new Error('Invalid command format: ' + commandParseResult.error.message),
    );
  }
  const parsedCommand = commandParseResult.data;

  const postChatMessageToChatRoomResult = await postChatMessageToChatRoom(
    {
      chatRoomId: parsedCommand.chatRoomId,
      message: {
        authorUserId: parsedCommand.authorUserId,
        content: parsedCommand.content,
      },
    },
    deps,
  );
  if (postChatMessageToChatRoomResult.isErr()) {
    return err(postChatMessageToChatRoomResult.error);
  }
  const { event } = postChatMessageToChatRoomResult.value;

  const kafkaMessage = chatMessagePostedToChatRoomEventToKafkaMessage(event);
  const storeEventResult = await sendMessageToKafka(kafkaMessage);
  if (storeEventResult.isErr()) {
    return err(storeEventResult.error);
  }

  return ok(event);
}
