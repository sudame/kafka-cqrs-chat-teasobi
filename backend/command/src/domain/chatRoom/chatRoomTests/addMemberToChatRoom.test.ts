import { describe, expect, test } from 'vitest';
import { generateUserId } from '../../user/userId';
import {
  addMemberToChatRoom,
  ChatRoomMemberAlreadyExistsError,
  ChatRoomOperatorNotMemberError,
} from '../chatRoom';
import { aChatRoom, aChatRoomMember } from './testHelpers';

describe('addMemberToChatRoom', () => {
  test('should add a new member to chat room', () => {
    const userId = generateUserId();
    const initialMember = aChatRoomMember().withUserId(userId).build();
    const chatRoom = aChatRoom()
      .withOperatorUserId(userId)
      .withMembers(initialMember)
      .buildUnsafe();

    const newMember = aChatRoomMember().build();
    const result = addMemberToChatRoom(chatRoom, newMember, userId);

    expect(result.isOk()).toBe(true);
    const updatedChatRoom = result._unsafeUnwrap();
    expect(updatedChatRoom.members.size).toBe(2);
    expect(updatedChatRoom.members.has(initialMember)).toBe(true);
    expect(updatedChatRoom.members.has(newMember)).toBe(true);
    expect(updatedChatRoom.id).toBe(chatRoom.id);
    expect(updatedChatRoom.name).toBe(chatRoom.name);
  });

  test('should not modify original chat room', () => {
    const userId = generateUserId();
    const existingMember = aChatRoomMember().withUserId(userId).build();
    const originalChatRoom = aChatRoom()
      .withName('Original Room')
      .withOperatorUserId(userId)
      .withMembers(existingMember)
      .buildUnsafe();
    const newMember = aChatRoomMember().build();

    const result = addMemberToChatRoom(originalChatRoom, newMember, userId);

    expect(result.isOk()).toBe(true);
    const updatedChatRoom = result._unsafeUnwrap();
    expect(originalChatRoom.members.size).toBe(1);
    expect(updatedChatRoom.members.size).toBe(2);
    expect(originalChatRoom.members).not.toBe(updatedChatRoom.members);
  });

  test('should return error when adding duplicate member', () => {
    const userId = generateUserId();
    const member = aChatRoomMember().withUserId(userId).build();
    const chatRoom = aChatRoom()
      .withName('Duplicate Test Room')
      .withOperatorUserId(userId)
      .withMembers(member)
      .buildUnsafe();

    const result = addMemberToChatRoom(chatRoom, member, userId);

    expect(result.isErr()).toBe(true);
    const error = result._unsafeUnwrapErr();
    expect(error).toBeInstanceOf(ChatRoomMemberAlreadyExistsError);
    expect(error.message).toBe(
      'ChatRoomMember already exists in the ChatRoom',
    );
  });

  test('should return error when operator is not a member of chat room', () => {
    const memberUserId = generateUserId();
    const operatorUserId = generateUserId(); // Different user, not a member
    const existingMember = aChatRoomMember().withUserId(memberUserId).build();
    const chatRoom = aChatRoom()
      .withName('No Operator Room')
      .withOperatorUserId(memberUserId) // Create with memberUserId as operator
      .withMembers(existingMember)
      .buildUnsafe();
    const newMember = aChatRoomMember().build();

    const result = addMemberToChatRoom(chatRoom, newMember, operatorUserId);

    expect(result.isErr()).toBe(true);
    const error = result._unsafeUnwrapErr();
    expect(error).toBeInstanceOf(ChatRoomOperatorNotMemberError);
    expect(error.message).toBe(
      'Operator must be a member of the ChatRoom to add members',
    );
  });

  test('should allow member to add another member when operator is valid member', () => {
    const operatorUserId = generateUserId();
    const anotherUserId = generateUserId();
    const operatorMember = aChatRoomMember().withUserId(operatorUserId).build();
    const anotherMember = aChatRoomMember().withUserId(anotherUserId).build();
    const chatRoom = aChatRoom()
      .withName('Valid Operator Room')
      .withOperatorUserId(operatorUserId)
      .withMembers(operatorMember, anotherMember)
      .buildUnsafe();
    const newMember = aChatRoomMember().build();

    // anotherUserId (who is a member) acts as operator
    const result = addMemberToChatRoom(chatRoom, newMember, anotherUserId);

    expect(result.isOk()).toBe(true);
    const updatedChatRoom = result._unsafeUnwrap();
    expect(updatedChatRoom.members.size).toBe(3);
    expect(updatedChatRoom.members.has(operatorMember)).toBe(true);
    expect(updatedChatRoom.members.has(anotherMember)).toBe(true);
    expect(updatedChatRoom.members.has(newMember)).toBe(true);
  });
});