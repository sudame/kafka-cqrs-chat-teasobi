import { err, ok, type Result } from 'neverthrow';
import type { UserId } from '../user/userId';
import { type ChatRoomId, generateChatRoomId } from './chatRoomId';
import type { ChatRoomMember } from './chatRoomMember';
import type { ChatRoomName } from './chatRoomName';
export type ChatRoom = {
  id: ChatRoomId;
  name: ChatRoomName;
  members: Set<ChatRoomMember>;
};

export class CreateChatRoomWithoutInitialMembersError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CreateChatRoomWithoutMembersError';
  }
}

export class CreateChatRoomOperatorNotInMembersError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CreateChatRoomOperatorNotInMembersError';
  }
}

export class ChatRoomMemberAlreadyExistsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChatRoomMemberAlreadyExistsError';
  }
}

export class ChatRoomMemberNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChatRoomMemberNotFoundError';
  }
}

interface CreateChatRoomParams {
  name: ChatRoomName;
  operatorUserId: UserId;
  initialMembers: Set<ChatRoomMember>;
}

export function createChatRoom(
  params: CreateChatRoomParams,
): Result<
  ChatRoom,
  | CreateChatRoomWithoutInitialMembersError
  | CreateChatRoomOperatorNotInMembersError
> {
  const id = generateChatRoomId();
  if (params.initialMembers.size === 0) {
    return err(
      new CreateChatRoomWithoutInitialMembersError(
        'ChatRoom must have at least one member',
      ),
    );
  }

  // Check if operator is in initial members
  const operatorIsInMembers = Array.from(params.initialMembers).some(
    (member) => member.userId === params.operatorUserId,
  );

  if (!operatorIsInMembers) {
    return err(
      new CreateChatRoomOperatorNotInMembersError(
        'Operator user must be included in initial members',
      ),
    );
  }

  return ok({ id, name: params.name, members: new Set(params.initialMembers) });
}

export function addMemberToChatRoom(
  chatRoom: ChatRoom,
  member: ChatRoomMember,
): Result<ChatRoom, ChatRoomMemberAlreadyExistsError> {
  if (chatRoom.members.has(member)) {
    return err(
      new ChatRoomMemberAlreadyExistsError(
        'ChatRoomMember already exists in the ChatRoom',
      ),
    );
  }

  const updatedMembers = new Set(chatRoom.members);
  updatedMembers.add(member);
  return ok({
    ...chatRoom,
    members: updatedMembers,
  });
}

export function removeMemberFromChatRoom(
  chatRoom: ChatRoom,
  member: ChatRoomMember,
): Result<ChatRoom, ChatRoomMemberNotFoundError> {
  if (!chatRoom.members.has(member)) {
    return err(
      new ChatRoomMemberNotFoundError(
        'ChatRoomMember not found in the ChatRoom',
      ),
    );
  }

  const updatedMembers = new Set(chatRoom.members);
  updatedMembers.delete(member);
  return ok({
    ...chatRoom,
    members: updatedMembers,
  });
}
