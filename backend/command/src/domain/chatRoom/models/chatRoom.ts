import { err, ok, Result } from 'neverthrow';
import { ChatRoomId } from './chatRoomId';
import { ChatRoomMember } from './chatRoomMember';
import { ChatMessage } from './chatMessage';
import { AggregateDomainObject } from '../../../core/aggregateDomainObject';

export type ChatRoom = {
  id: ChatRoomId;
  version: number;
  name: string;
  createdAt: Date;
  members: ChatRoomMember[];
  messages: ChatMessage[];
} & AggregateDomainObject<ChatRoomId>;

export type CreateChatRoomArgs = ChatRoom;

export function createChatRoom(
  args: CreateChatRoomArgs,
): Result<ChatRoom, Error> {
  // チャットルーム名は空であってはならない
  if (args.name === '') {
    return err(new Error('Chat room name cannot be empty.'));
  }

  // チャットルームのメンバーは空であってはならない
  if (args.members.length === 0) {
    return err(new Error('Chat room must have at least one member.'));
  }

  // チャットルームのメンバーはユニークでなければならない
  const memberIds = new Set(args.members.map((member) => member.id.value));
  if (memberIds.size !== args.members.length) {
    return err(new Error('Chat room members must be unique.'));
  }

  const chatRoom: ChatRoom = {
    ...args,
  };

  return ok(chatRoom);
}

export function postMessageToChatRoom(
  chatRoom: ChatRoom,
  message: ChatMessage,
): Result<ChatRoom, Error> {
  // メッセージの投稿者はチャットルームのメンバーでなければならない
  if (
    !chatRoom.members.some(
      (member) => member.user.id.value === message.authorUser.id.value,
    )
  ) {
    return err(new Error('Message author must be a member of the chat room.'));
  }

  const updatedChatRoom: ChatRoom = {
    ...chatRoom,
    version: chatRoom.version + 1,
    messages: [...chatRoom.messages, { ...message }],
  };

  return ok(updatedChatRoom);
}
