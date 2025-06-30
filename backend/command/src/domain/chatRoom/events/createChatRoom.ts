import { DomainObjectId } from '../../../core/domainObjectId';
import { ChatRoom, ChatRoomMember } from '../models/chatRoom';

export interface CreateChatRoomEvent {
  type: 'CreateChatRoom';
  chatRoomId: DomainObjectId;
  chatRoomName: string;
  members: ChatRoomMember[];
  createdAt: number;
  newChatRoomVersion: 1; // このイベントによってチャットルームのバージョンは必ず1になる
}

export function applyCreateChatRoomEventToChatRoom(
  chatRoom: ChatRoom | null,
  event: CreateChatRoomEvent,
): ChatRoom {
  if (chatRoom != null) {
    throw new Error('Chat room already exists.');
  }

  const newChatRoom: ChatRoom = {
    createdAt: event.createdAt,
    id: event.chatRoomId,
    version: event.newChatRoomVersion,
    name: event.chatRoomName,
    members: event.members,
    messages: [],
    internal: {
      kafkaLatestOffset: null, // 初期状態ではオフセットは設定しない
    },
  };

  return newChatRoom;
}
