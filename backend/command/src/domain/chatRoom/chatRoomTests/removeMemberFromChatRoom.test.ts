import { describe, expect, test } from 'vitest';
import { generateUserId } from '../../user/userId';
import {
  ChatRoomCannotRemoveSelfError,
  ChatRoomMemberNotFoundError,
  ChatRoomOperatorNotMemberError,
  createChatRoom,
  removeMemberFromChatRoom,
} from '../chatRoom';
import { createChatRoomMember } from '../chatRoomMember';
import { chatRoomNameFromString } from '../chatRoomName';

describe('removeMemberFromChatRoom', () => {
  test('should remove existing member from chat room', () => {
    const name = chatRoomNameFromString('Test Room')._unsafeUnwrap();
    const userId1 = generateUserId();
    const userId2 = generateUserId();
    const member1 = createChatRoomMember({ userId: userId1 });
    const member2 = createChatRoomMember({ userId: userId2 });
    const chatRoom = createChatRoom({
      name,
      operatorUserId: userId1,
      initialMembers: new Set([member1, member2]),
    })._unsafeUnwrap();

    // userId1 (operator) removes member2 (not themselves)
    const result = removeMemberFromChatRoom(chatRoom, member2, userId1);

    expect(result.isOk()).toBe(true);
    const updatedChatRoom = result._unsafeUnwrap();
    expect(updatedChatRoom.members.size).toBe(1);
    expect(updatedChatRoom.members.has(member1)).toBe(true);
    expect(updatedChatRoom.members.has(member2)).toBe(false);
    expect(updatedChatRoom.id).toBe(chatRoom.id);
    expect(updatedChatRoom.name).toBe(chatRoom.name);
  });

  test('should not modify original chat room', () => {
    const name = chatRoomNameFromString('Original Room')._unsafeUnwrap();
    const userId1 = generateUserId();
    const userId2 = generateUserId();
    const member1 = createChatRoomMember({ userId: userId1 });
    const member2 = createChatRoomMember({ userId: userId2 });
    const originalChatRoom = createChatRoom({
      name,
      operatorUserId: userId1,
      initialMembers: new Set([member1, member2]),
    })._unsafeUnwrap();

    // operator removes another member, not themselves
    const result = removeMemberFromChatRoom(originalChatRoom, member2, userId1);

    expect(result.isOk()).toBe(true);
    const updatedChatRoom = result._unsafeUnwrap();
    expect(originalChatRoom.members.size).toBe(2);
    expect(updatedChatRoom.members.size).toBe(1);
    expect(originalChatRoom.members).not.toBe(updatedChatRoom.members);
  });

  test('should return error when removing non-existing member', () => {
    const name = chatRoomNameFromString(
      'Non-existing Test Room',
    )._unsafeUnwrap();
    const userId1 = generateUserId();
    const existingMember = createChatRoomMember({ userId: userId1 });
    const nonExistingMember = createChatRoomMember({
      userId: generateUserId(),
    });
    const chatRoom = createChatRoom({
      name,
      operatorUserId: userId1,
      initialMembers: new Set([existingMember]),
    })._unsafeUnwrap();

    const result = removeMemberFromChatRoom(chatRoom, nonExistingMember, userId1);

    expect(result.isErr()).toBe(true);
    const error = result._unsafeUnwrapErr();
    expect(error).toBeInstanceOf(ChatRoomMemberNotFoundError);
    expect(error.message).toBe('ChatRoomMember not found in the ChatRoom');
  });

  test('should remove member from chat room with multiple members', () => {
    const name = chatRoomNameFromString('Multiple Members Room')._unsafeUnwrap();
    const userId1 = generateUserId();
    const userId2 = generateUserId();
    const userId3 = generateUserId();
    const member1 = createChatRoomMember({ userId: userId1 });
    const member2 = createChatRoomMember({ userId: userId2 });
    const member3 = createChatRoomMember({ userId: userId3 });
    const chatRoom = createChatRoom({
      name,
      operatorUserId: userId1,
      initialMembers: new Set([member1, member2, member3]),
    })._unsafeUnwrap();

    // operator removes member2 (not themselves)
    const result = removeMemberFromChatRoom(chatRoom, member2, userId1);

    expect(result.isOk()).toBe(true);
    const updatedChatRoom = result._unsafeUnwrap();
    expect(updatedChatRoom.members.size).toBe(2);
    expect(updatedChatRoom.members.has(member1)).toBe(true);
    expect(updatedChatRoom.members.has(member2)).toBe(false);
    expect(updatedChatRoom.members.has(member3)).toBe(true);
  });


  test('should return error when operator is not a member of chat room', () => {
    const name = chatRoomNameFromString('No Remove Operator Room')._unsafeUnwrap();
    const memberUserId = generateUserId();
    const operatorUserId = generateUserId(); // Different user, not a member
    const existingMember = createChatRoomMember({ userId: memberUserId });
    const chatRoom = createChatRoom({
      name,
      operatorUserId: memberUserId, // Create with memberUserId as operator
      initialMembers: new Set([existingMember]),
    })._unsafeUnwrap();

    const result = removeMemberFromChatRoom(chatRoom, existingMember, operatorUserId);

    expect(result.isErr()).toBe(true);
    const error = result._unsafeUnwrapErr();
    expect(error).toBeInstanceOf(ChatRoomOperatorNotMemberError);
    expect(error.message).toBe(
      'Operator must be a member of the ChatRoom to remove members',
    );
  });

  test('should allow member to remove another member when operator is valid member', () => {
    const name = chatRoomNameFromString('Valid Remove Operator Room')._unsafeUnwrap();
    const operatorUserId = generateUserId();
    const memberToRemoveUserId = generateUserId();
    const operatorMember = createChatRoomMember({ userId: operatorUserId });
    const memberToRemove = createChatRoomMember({ userId: memberToRemoveUserId });
    const chatRoom = createChatRoom({
      name,
      operatorUserId,
      initialMembers: new Set([operatorMember, memberToRemove]),
    })._unsafeUnwrap();

    const result = removeMemberFromChatRoom(chatRoom, memberToRemove, operatorUserId);

    expect(result.isOk()).toBe(true);
    const updatedChatRoom = result._unsafeUnwrap();
    expect(updatedChatRoom.members.size).toBe(1);
    expect(updatedChatRoom.members.has(operatorMember)).toBe(true);
    expect(updatedChatRoom.members.has(memberToRemove)).toBe(false);
  });

  test('should return error when trying to remove themselves', () => {
    const name = chatRoomNameFromString('Self Remove Room')._unsafeUnwrap();
    const userId1 = generateUserId();
    const userId2 = generateUserId();
    const member1 = createChatRoomMember({ userId: userId1 });
    const member2 = createChatRoomMember({ userId: userId2 });
    const chatRoom = createChatRoom({
      name,
      operatorUserId: userId1,
      initialMembers: new Set([member1, member2]),
    })._unsafeUnwrap();

    // member2 tries to remove themselves
    const result = removeMemberFromChatRoom(chatRoom, member2, userId2);

    expect(result.isErr()).toBe(true);
    const error = result._unsafeUnwrapErr();
    expect(error).toBeInstanceOf(ChatRoomCannotRemoveSelfError);
    expect(error.message).toBe('Cannot remove yourself from the ChatRoom');
  });

  test('should return error when single member tries to remove themselves', () => {
    const name = chatRoomNameFromString('Single Self Remove Room')._unsafeUnwrap();
    const userId = generateUserId();
    const member = createChatRoomMember({ userId });
    const chatRoom = createChatRoom({
      name,
      operatorUserId: userId,
      initialMembers: new Set([member]),
    })._unsafeUnwrap();

    const result = removeMemberFromChatRoom(chatRoom, member, userId);

    expect(result.isErr()).toBe(true);
    const error = result._unsafeUnwrapErr();
    expect(error).toBeInstanceOf(ChatRoomCannotRemoveSelfError);
    expect(error.message).toBe('Cannot remove yourself from the ChatRoom');
  });
});