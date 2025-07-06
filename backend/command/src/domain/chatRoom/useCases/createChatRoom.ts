import { err, ok, Result } from 'neverthrow';
import { ChatRoom, createChatRoom } from '../models/chatRoom';
import { generateChatRoomId } from '../models/chatRoomId';
import { CreateChatRoomArgs as CreateChatRoomModelArgs } from '../models/chatRoom';
import { newUserId } from '../../user/models/userId';
import { rebuildUser } from '../../user/rebuildUser';
import { Kafka } from 'kafkajs';
import { generateChatRoomMemberId } from '../models/chatRoomMemberId';
import { ChatRoomCreatedEvent } from '../events/chatRoomCreated';

export type CreateChatRoomArgs = {
  chatRoomName: string;
  creatorUserId: string;
};

export type CreateChatRoomOkResult = {
  chatRoom: ChatRoom;
  event: ChatRoomCreatedEvent;
};

export type CreateChatRoom = (
  args: CreateChatRoomArgs,
) => Promise<Result<CreateChatRoomOkResult, Error>>;

export function createCreateChatRoom(deps: { kafka: Kafka }): CreateChatRoom {
  return async (args) => {
    const newUserIdResult = newUserId(args.creatorUserId);
    if (newUserIdResult.isErr()) {
      return err(newUserIdResult.error);
    }
    const creatorUserId = newUserIdResult.value;

    const rebuildUserResult = await rebuildUser(creatorUserId, deps.kafka);
    if (rebuildUserResult.isErr()) {
      return err(rebuildUserResult.error);
    }
    const creatorUser = rebuildUserResult.value;

    const generateChatRoomIdResult = generateChatRoomId();
    if (generateChatRoomIdResult.isErr()) {
      const error = generateChatRoomIdResult.error;
      return err(error);
    }
    const chatRoomId = generateChatRoomIdResult.value;

    const generateChatRoomMemberIdResult = generateChatRoomMemberId();
    if (generateChatRoomMemberIdResult.isErr()) {
      return err(generateChatRoomMemberIdResult.error);
    }
    const creatorUserMemberId = generateChatRoomMemberIdResult.value;

    const createChatRoomModelArgs: CreateChatRoomModelArgs = {
      id: chatRoomId,
      version: 1,
      createdAt: new Date(),
      name: args.chatRoomName,
      members: [
        {
          id: creatorUserMemberId,
          user: creatorUser,
        },
      ],
      messages: [],
    };

    const createChatRoomResult = createChatRoom(createChatRoomModelArgs);
    if (createChatRoomResult.isErr()) {
      return err(createChatRoomResult.error);
    }
    const chatRoom = createChatRoomResult.value;

    const event: ChatRoomCreatedEvent = {
      type: 'chat-room-created',
      chatRoom: {
        id: chatRoom.id.value,
        name: chatRoom.name,
        version: chatRoom.version,
        createdAt: chatRoom.createdAt.getTime(),
        members: chatRoom.members.map((member) => ({
          id: member.id.value,
          userId: member.user.id.value,
        })),
      },
      createdAt: Date.now(),
      toVersion: 1,
    };

    return ok({
      chatRoom,
      event,
    });
  };
}
