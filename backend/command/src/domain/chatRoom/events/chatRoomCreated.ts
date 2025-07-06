import { err, ok, Result } from 'neverthrow';
import { ChatRoom } from '../models/chatRoom';
import { newChatRoomIdFromSafeValue } from '../models/chatRoomId';
import { newChatRoomMemberIdFromSafeValue } from '../models/chatRoomMemberId';
import { rebuildUser } from '../../user/rebuildUser';
import { Kafka } from 'kafkajs';
import { newUserIdFromSafeValue } from '../../user/models/userId';
import { ChatRoomMember } from '../models/chatRoomMember';

export type ChatRoomCreatedEvent = {
  type: 'chat-room-created';
  chatRoom: {
    id: string;
    name: string;
    version: number;
    createdAt: number;
    members: {
      id: string;
      userId: string;
    }[];
  };
  createdAt: number;
  toVersion: number;
};

export function chatRoomCreatedEventToKafkaMessage(
  event: ChatRoomCreatedEvent,
): { key: string; value: string } {
  return {
    key: event.chatRoom.id,
    value: JSON.stringify(event),
  };
}

async function rebuildChatRoomMember(
  memberFromEvent: {
    id: string;
    userId: string;
  },
  deps: { kafka: Kafka },
): Promise<Result<ChatRoomMember, Error>> {
  const memberId = newChatRoomMemberIdFromSafeValue(memberFromEvent.id);
  const memberUserId = newUserIdFromSafeValue(memberFromEvent.userId);
  const rebuildUserResult = await rebuildUser(memberUserId, deps.kafka);
  if (rebuildUserResult.isErr()) {
    return err(rebuildUserResult.error);
  }
  const member: ChatRoomMember = {
    id: memberId,
    user: rebuildUserResult.value,
  };
  return ok(member);
}

export async function applyCreateChatRoomEventToChatRoom(
  chatRoom: ChatRoom | null,
  event: ChatRoomCreatedEvent,
  deps: { kafka: Kafka },
): Promise<Result<ChatRoom, Error>> {
  if (chatRoom != null) {
    throw new Error('Chat room already exists.');
  }

  const rebuildMembersResult = Result.combine(
    await Promise.all(
      event.chatRoom.members.map((memberFromEvent) =>
        rebuildChatRoomMember(memberFromEvent, deps),
      ),
    ),
  );
  if (rebuildMembersResult.isErr()) {
    return err(rebuildMembersResult.error);
  }
  const members = rebuildMembersResult.value;

  const newChatRoom: ChatRoom = {
    id: newChatRoomIdFromSafeValue(event.chatRoom.id),
    name: event.chatRoom.name,
    version: event.chatRoom.version,
    createdAt: new Date(event.chatRoom.createdAt),
    messages: [],
    members,
  };

  return ok(newChatRoom);
}
