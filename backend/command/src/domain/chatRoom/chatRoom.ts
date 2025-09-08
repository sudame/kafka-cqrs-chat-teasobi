import { err, ok, type Result } from 'neverthrow';
import { type ChatRoomId, generateChatRoomId } from './chatRoomId';
import type { ChatRoomMember } from './chatRoomMember';
import type { ChatRoomName } from './chatRoomName';

export type ChatRoom = {
  id: ChatRoomId;
  name: ChatRoomName;
  members: Set<ChatRoomMember>;
};

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
  initialMembers: Set<ChatRoomMember>;
}

export function createChatRoom(params: CreateChatRoomParams): ChatRoom {
  const id = generateChatRoomId();
  return { id, name: params.name, members: new Set(params.initialMembers) };
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
