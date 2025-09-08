import { err, ok, type Result } from 'neverthrow';
import type { UserId } from '../user/userId';
import { type ChatRoomId, generateChatRoomId } from './chatRoomId';
import type { ChatRoomMember } from './chatRoomMember';
import type { ChatRoomMessage } from './chatRoomMessage';
import type { ChatRoomName } from './chatRoomName';
export type ChatRoom = {
  id: ChatRoomId;
  name: ChatRoomName;
  members: Set<ChatRoomMember>;
  messages: ChatRoomMessage[];
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

export class ChatRoomOperatorNotMemberError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChatRoomOperatorNotMemberError';
  }
}

export class ChatRoomCannotRemoveSelfError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChatRoomCannotRemoveSelfError';
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

function validateOperatorMembership(
  chatRoom: ChatRoom,
  operatorUserId: UserId,
  operation: string,
): Result<void, ChatRoomOperatorNotMemberError> {
  const isOperatorMember = Array.from(chatRoom.members).some(
    (member) => member.userId === operatorUserId,
  );

  if (!isOperatorMember) {
    return err(
      new ChatRoomOperatorNotMemberError(
        `Operator must be a member of the ChatRoom to ${operation}`,
      ),
    );
  }

  return ok(undefined);
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

  return ok({ id, name: params.name, members: new Set(params.initialMembers), messages: [] });
}

export function addMemberToChatRoom(
  chatRoom: ChatRoom,
  member: ChatRoomMember,
  operatorUserId: UserId,
): Result<ChatRoom, ChatRoomMemberAlreadyExistsError | ChatRoomOperatorNotMemberError> {
  // Validate operator membership
  const operatorValidation = validateOperatorMembership(chatRoom, operatorUserId, 'add members');
  if (operatorValidation.isErr()) {
    return err(operatorValidation.error);
  }

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
  operatorUserId: UserId,
): Result<ChatRoom, ChatRoomMemberNotFoundError | ChatRoomOperatorNotMemberError | ChatRoomCannotRemoveSelfError> {
  // Validate operator membership
  const operatorValidation = validateOperatorMembership(chatRoom, operatorUserId, 'remove members');
  if (operatorValidation.isErr()) {
    return err(operatorValidation.error);
  }

  // Check if operator is trying to remove themselves
  if (member.userId === operatorUserId) {
    return err(
      new ChatRoomCannotRemoveSelfError(
        'Cannot remove yourself from the ChatRoom',
      ),
    );
  }

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
