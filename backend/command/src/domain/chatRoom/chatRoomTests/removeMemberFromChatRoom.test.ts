import { describe, expect, test } from 'vitest';
import { generateUserId } from '../../user/userId';
import {
  ChatRoomCannotRemoveSelfError,
  ChatRoomMemberNotFoundError,
  ChatRoomOperatorNotMemberError,
  removeMemberFromChatRoom,
} from '../chatRoom';
import { aChatRoom, aChatRoomMember } from './testHelpers';

describe('removeMemberFromChatRoom', () => {
  test('should remove existing member from chat room', () => {
    const userId1 = generateUserId();
    const userId2 = generateUserId();
    const member1 = aChatRoomMember().withUserId(userId1).build();
    const member2 = aChatRoomMember().withUserId(userId2).build();
    const chatRoom = aChatRoom()
      .withOperatorUserId(userId1)
      .withMembers(member1, member2)
      .buildUnsafe();

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
    const userId1 = generateUserId();
    const userId2 = generateUserId();
    const member1 = aChatRoomMember().withUserId(userId1).build();
    const member2 = aChatRoomMember().withUserId(userId2).build();
    const originalChatRoom = aChatRoom()
      .withName('Original Room')
      .withOperatorUserId(userId1)
      .withMembers(member1, member2)
      .buildUnsafe();

    // operator removes another member, not themselves
    const result = removeMemberFromChatRoom(originalChatRoom, member2, userId1);

    expect(result.isOk()).toBe(true);
    const updatedChatRoom = result._unsafeUnwrap();
    expect(originalChatRoom.members.size).toBe(2);
    expect(updatedChatRoom.members.size).toBe(1);
    expect(originalChatRoom.members).not.toBe(updatedChatRoom.members);
  });

  test('should return error when removing non-existing member', () => {
    const userId1 = generateUserId();
    const existingMember = aChatRoomMember().withUserId(userId1).build();
    const nonExistingMember = aChatRoomMember().build();
    const chatRoom = aChatRoom()
      .withName('Non-existing Test Room')
      .withOperatorUserId(userId1)
      .withMembers(existingMember)
      .buildUnsafe();

    const result = removeMemberFromChatRoom(chatRoom, nonExistingMember, userId1);

    expect(result.isErr()).toBe(true);
    const error = result._unsafeUnwrapErr();
    expect(error).toBeInstanceOf(ChatRoomMemberNotFoundError);
    expect(error.message).toBe('ChatRoomMember not found in the ChatRoom');
  });

  test('should remove member from chat room with multiple members', () => {
    const userId1 = generateUserId();
    const userId2 = generateUserId();
    const userId3 = generateUserId();
    const member1 = aChatRoomMember().withUserId(userId1).build();
    const member2 = aChatRoomMember().withUserId(userId2).build();
    const member3 = aChatRoomMember().withUserId(userId3).build();
    const chatRoom = aChatRoom()
      .withName('Multiple Members Room')
      .withOperatorUserId(userId1)
      .withMembers(member1, member2, member3)
      .buildUnsafe();

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
    const memberUserId = generateUserId();
    const operatorUserId = generateUserId(); // Different user, not a member
    const existingMember = aChatRoomMember().withUserId(memberUserId).build();
    const chatRoom = aChatRoom()
      .withName('No Remove Operator Room')
      .withOperatorUserId(memberUserId) // Create with memberUserId as operator
      .withMembers(existingMember)
      .buildUnsafe();

    const result = removeMemberFromChatRoom(chatRoom, existingMember, operatorUserId);

    expect(result.isErr()).toBe(true);
    const error = result._unsafeUnwrapErr();
    expect(error).toBeInstanceOf(ChatRoomOperatorNotMemberError);
    expect(error.message).toBe(
      'Operator must be a member of the ChatRoom to remove members',
    );
  });

  test('should allow member to remove another member when operator is valid member', () => {
    const operatorUserId = generateUserId();
    const memberToRemoveUserId = generateUserId();
    const operatorMember = aChatRoomMember().withUserId(operatorUserId).build();
    const memberToRemove = aChatRoomMember().withUserId(memberToRemoveUserId).build();
    const chatRoom = aChatRoom()
      .withName('Valid Remove Operator Room')
      .withOperatorUserId(operatorUserId)
      .withMembers(operatorMember, memberToRemove)
      .buildUnsafe();

    const result = removeMemberFromChatRoom(chatRoom, memberToRemove, operatorUserId);

    expect(result.isOk()).toBe(true);
    const updatedChatRoom = result._unsafeUnwrap();
    expect(updatedChatRoom.members.size).toBe(1);
    expect(updatedChatRoom.members.has(operatorMember)).toBe(true);
    expect(updatedChatRoom.members.has(memberToRemove)).toBe(false);
  });

  test('should return error when trying to remove themselves', () => {
    const userId1 = generateUserId();
    const userId2 = generateUserId();
    const member1 = aChatRoomMember().withUserId(userId1).build();
    const member2 = aChatRoomMember().withUserId(userId2).build();
    const chatRoom = aChatRoom()
      .withName('Self Remove Room')
      .withOperatorUserId(userId1)
      .withMembers(member1, member2)
      .buildUnsafe();

    // member2 tries to remove themselves
    const result = removeMemberFromChatRoom(chatRoom, member2, userId2);

    expect(result.isErr()).toBe(true);
    const error = result._unsafeUnwrapErr();
    expect(error).toBeInstanceOf(ChatRoomCannotRemoveSelfError);
    expect(error.message).toBe('Cannot remove yourself from the ChatRoom');
  });

  test('should return error when single member tries to remove themselves', () => {
    const userId = generateUserId();
    const member = aChatRoomMember().withUserId(userId).build();
    const chatRoom = aChatRoom()
      .withName('Single Self Remove Room')
      .withOperatorUserId(userId)
      .withMembers(member)
      .buildUnsafe();

    const result = removeMemberFromChatRoom(chatRoom, member, userId);

    expect(result.isErr()).toBe(true);
    const error = result._unsafeUnwrapErr();
    expect(error).toBeInstanceOf(ChatRoomCannotRemoveSelfError);
    expect(error.message).toBe('Cannot remove yourself from the ChatRoom');
  });
});