import { type ChatRoomMemberId, generateChatRoomMemberId } from './chatRoomMemberId';

export type ChatRoomMember = {
  memberId: ChatRoomMemberId;
};

export function createChatRoomMember(): ChatRoomMember {
  const memberId = generateChatRoomMemberId();
  return { memberId };
}