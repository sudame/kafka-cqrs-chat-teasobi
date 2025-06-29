import { err, ok, Result } from 'neverthrow';

export interface ChatRoomMember {
  id: string;
  userId: string;
}

export interface ChatRoom {
  id: string;
  version: number;
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

export function newChatRoom(id: string): ChatRoom {
  return {
    id,
    version: 0,
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
