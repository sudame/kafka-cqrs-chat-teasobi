import { type ChatRoomId, generateChatRoomId } from './chatRoomId';
import type { ChatRoomName } from './chatRoomName';

export type ChatRoom = {
  id: ChatRoomId;
  name: ChatRoomName;
};

interface CreateChatRoomParams {
  name: ChatRoomName;
}

export function createChatRoom(params: CreateChatRoomParams): ChatRoom {
  const id = generateChatRoomId();
  return { id, name: params.name };
}
