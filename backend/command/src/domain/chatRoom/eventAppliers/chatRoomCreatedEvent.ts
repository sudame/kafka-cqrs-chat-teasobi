import { ChatRoomCreatedEvent } from '@share/events/chatRoomCreated';
import { Kafka } from 'kafkajs';
import { Result, err, ok } from 'neverthrow';
import { newUserIdFromSafeValue } from '../../user/models/userId';
import { rebuildUser } from '../../user/rebuildUser';
import { ChatRoom } from '../models/chatRoom';
import { newChatRoomIdFromSafeValue } from '../models/chatRoomId';
import { ChatRoomMember } from '../models/chatRoomMember';
import { newChatRoomMemberIdFromSafeValue } from '../models/chatRoomMemberId';

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
