import type { UserId } from '../user/userId';
import {
  type ChatRoomMemberId,
  generateChatRoomMemberId,
} from './chatRoomMemberId';

export type ChatRoomMember = {
  memberId: ChatRoomMemberId;
  userId: UserId;
};

export type CreateChatRoomMemberParams = {
  userId: UserId;
};

export function createChatRoomMember(
  params: CreateChatRoomMemberParams,
): ChatRoomMember {
  const memberId = generateChatRoomMemberId();
  return { memberId, userId: params.userId };
}
