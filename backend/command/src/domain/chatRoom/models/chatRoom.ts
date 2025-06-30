import { err, ok, Result } from 'neverthrow';
import {
  DomainObjectId,
  newDomainObjectId,
} from '../../../core/domainObjectId';

export interface ChatRoomMember {
  id: string;
  userId: string;
}

export interface ChatRoom {
  id: string;
  version: number;
  name: string;
  createdAt: number;
  members: ChatRoomMember[];
  messages: ChatMessage[];
  internal: {
    kafkaLatestOffset: string | null;
  };
}

export interface ChatMessage {
  id: string;
  postedAt: number;
  authorUserId: string;
  content: string;
}

export function newChatRoomId(
  uniqueIdGenerator?: () => string,
): DomainObjectId {
  return newDomainObjectId('chat-room', uniqueIdGenerator);
}

export function emptyChatRoom(id: string): ChatRoom {
  return {
    id,
    version: 0,
    createdAt: 0,
    name: '',
    members: [],
    messages: [],
    internal: {
      kafkaLatestOffset: null,
    },
  };
}

export function kafkaKeyForChatRoom(chatRoomId: string): string {
  return `chat-room-${chatRoomId}`;
}

interface CanPostMessageArgs {
  chatRoom: ChatRoom | null;
  operatorUserId: string;
  messageContent: string;
}

export function canPostMessage({
  chatRoom,
  messageContent,
  operatorUserId,
}: CanPostMessageArgs): Result<ChatRoom, Error> {
  // TODO: 各ルールをドメインルールに切り出し

  // ルール1: チャットルームが存在すること
  if (chatRoom == null) {
    return err(new Error('Chat room not found.'));
  }

  // ルール2: チャットルームのメンバーであること
  if (!chatRoom.members.some((member) => member.userId === operatorUserId)) {
    return err(new Error('User is not a member of the chat room.'));
  }

  // ルール3: メッセージの内容が空でないこと
  if (messageContent.trim() === '') {
    return err(new Error('Message content cannot be empty.'));
  }

  return ok(chatRoom);
}

interface CanCreateChatRoomArgs {
  chatRoomName: string;
  chatRoomMembers: ChatRoomMember[];
  operatorUserId: string;
}

export function canCreateChatRoom({}) {
  // すべてのメンバーが存在すること
  // TODO: メンバーのドメインオブジェクトが存在しないので作る
  // if()
}
