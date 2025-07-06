import { err, ok, Result } from 'neverthrow';
import { ChatRoom, postMessageToChatRoom } from '../models/chatRoom';
import { ChatMessagePostedToChatRoomEvent } from '../../../../../share/events/chatMessagePostedToChatRoom';
import { generateChatMessageId } from '../models/ChatMessageId';
import {
  createChatMessage,
  CreateChatMessageArgs,
} from '../models/chatMessage';
import { rebuildChatRoom } from '../rebuildChatRoom';
import { newChatRoomId } from '../models/chatRoomId';
import { Kafka } from 'kafkajs';
import { newUserId } from '../../user/models/userId';
import { rebuildUser } from '../../user/rebuildUser';

export type PostChatMessageToChatRoomOkResult = {
  chatRoom: ChatRoom;
  event: ChatMessagePostedToChatRoomEvent;
};

export type PostChatMessageToChatRoomArgs = {
  chatRoomId: string;
  message: {
    authorUserId: string;
    content: string;
  };
};

export type PostChatMessageToChatRoom = (
  args: PostChatMessageToChatRoomArgs,
  deps: { kafka: Kafka },
) => Promise<Result<PostChatMessageToChatRoomOkResult, Error>>;

export function createPostChatMessageToChatRoom(): PostChatMessageToChatRoom {
  return async (args, deps) => {
    const newChatRoomIdResult = newChatRoomId(args.chatRoomId);
    if (newChatRoomIdResult.isErr()) {
      return err(newChatRoomIdResult.error);
    }
    const chatRoomId = newChatRoomIdResult.value;

    const rebuildChatRoomResult = await rebuildChatRoom(chatRoomId, deps.kafka);
    if (rebuildChatRoomResult.isErr()) {
      return err(rebuildChatRoomResult.error);
    }
    const chatRoom = rebuildChatRoomResult.value;

    const generateChatMessageIdResult = generateChatMessageId();
    if (generateChatMessageIdResult.isErr()) {
      return err(generateChatMessageIdResult.error);
    }
    const chatMessageId = generateChatMessageIdResult.value;

    const newUserIdResult = newUserId(args.message.authorUserId);
    if (newUserIdResult.isErr()) {
      return err(newUserIdResult.error);
    }
    const authorUserId = newUserIdResult.value;

    const rebuildUserResult = await rebuildUser(authorUserId, deps.kafka);
    if (rebuildUserResult.isErr()) {
      return err(rebuildUserResult.error);
    }
    const authorUser = rebuildUserResult.value;

    const createChatMessageArgs: CreateChatMessageArgs = {
      id: chatMessageId,
      postedAt: new Date(),
      content: args.message.content,
      authorUser,
    };
    const createChatMessageResult = createChatMessage(createChatMessageArgs);
    if (createChatMessageResult.isErr()) {
      return err(createChatMessageResult.error);
    }
    const chatMessage = createChatMessageResult.value;

    const postMessageToChatRoomResult = postMessageToChatRoom(
      chatRoom,
      chatMessage,
    );
    if (postMessageToChatRoomResult.isErr()) {
      return err(postMessageToChatRoomResult.error);
    }
    const updatedChatRoom = postMessageToChatRoomResult.value;

    const event: ChatMessagePostedToChatRoomEvent = {
      type: 'chat-message-posted-to-chat-room',
      chatRoomId: updatedChatRoom.id.value,
      chatMessage: {
        id: chatMessage.id.value,
        postedAt: chatMessage.postedAt.getTime(),
        authorUserId: chatMessage.authorUser.id.value,
        content: chatMessage.content,
      },
      createdAt: Date.now(),
      toVersion: updatedChatRoom.version,
    };

    return ok({
      chatRoom: updatedChatRoom,
      event: event,
    });
  };
}
