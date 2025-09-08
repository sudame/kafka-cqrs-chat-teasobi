import { type ChatRoomId, generateChatRoomId } from './chatRoomId';
import type { ChatRoomMember } from './chatRoomMember';
import type { ChatRoomName } from './chatRoomName';

export type ChatRoom = {
  id: ChatRoomId;
  name: ChatRoomName;
  members: Set<ChatRoomMember>;
};

interface CreateChatRoomParams {
  name: ChatRoomName;
  initialMembers: Set<ChatRoomMember>;
}

export function createChatRoom(params: CreateChatRoomParams): ChatRoom {
  const id = generateChatRoomId();
  return { id, name: params.name, members: new Set(params.initialMembers) };
}
