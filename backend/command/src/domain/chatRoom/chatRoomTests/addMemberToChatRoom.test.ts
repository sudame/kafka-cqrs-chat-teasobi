import { describe, expect, test } from 'vitest';
import { generateUserId } from '../../user/userId';
import {
  addMemberToChatRoom,
  ChatRoomMemberAlreadyExistsError,
  ChatRoomOperatorNotMemberError,
  createChatRoom,
} from '../chatRoom';
import { createChatRoomMember } from '../chatRoomMember';
import { chatRoomNameFromString } from '../chatRoomName';

describe('addMemberToChatRoom', () => {
  test('should add a new member to chat room', () => {
    const name = chatRoomNameFromString('Test Room')._unsafeUnwrap();
    const userId = generateUserId();
    const initialMember = createChatRoomMember({ userId });
    const chatRoom = createChatRoom({
      name,
      operatorUserId: userId,
      initialMembers: new Set([initialMember]),
    })._unsafeUnwrap();

    const newMember = createChatRoomMember({ userId: generateUserId() });
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
    const name = chatRoomNameFromString('Original Room')._unsafeUnwrap();
    const userId = generateUserId();
    const existingMember = createChatRoomMember({ userId });
    const originalChatRoom = createChatRoom({
      name,
      operatorUserId: userId,
      initialMembers: new Set([existingMember]),
    })._unsafeUnwrap();
    const newMember = createChatRoomMember({ userId: generateUserId() });

    const result = addMemberToChatRoom(originalChatRoom, newMember, userId);

    expect(result.isOk()).toBe(true);
    const updatedChatRoom = result._unsafeUnwrap();
    expect(originalChatRoom.members.size).toBe(1);
    expect(updatedChatRoom.members.size).toBe(2);
    expect(originalChatRoom.members).not.toBe(updatedChatRoom.members);
  });

  test('should return error when adding duplicate member', () => {
    const name = chatRoomNameFromString(
      'Duplicate Test Room',
    )._unsafeUnwrap();
    const userId = generateUserId();
    const member = createChatRoomMember({ userId });
    const chatRoom = createChatRoom({
      name,
      operatorUserId: userId,
      initialMembers: new Set([member]),
    })._unsafeUnwrap();

    const result = addMemberToChatRoom(chatRoom, member, userId);

    expect(result.isErr()).toBe(true);
    const error = result._unsafeUnwrapErr();
    expect(error).toBeInstanceOf(ChatRoomMemberAlreadyExistsError);
    expect(error.message).toBe(
      'ChatRoomMember already exists in the ChatRoom',
    );
  });

  test('should add member to existing chat room', () => {
    const name = chatRoomNameFromString('Existing Room')._unsafeUnwrap();
    const userId = generateUserId();
    const existingMember = createChatRoomMember({ userId });
    const chatRoom = createChatRoom({
      name,
      operatorUserId: userId,
      initialMembers: new Set([existingMember]),
    })._unsafeUnwrap();
    const newMember = createChatRoomMember({ userId: generateUserId() });

    const result = addMemberToChatRoom(chatRoom, newMember, userId);

    expect(result.isOk()).toBe(true);
    const updatedChatRoom = result._unsafeUnwrap();
    expect(updatedChatRoom.members.size).toBe(2);
    expect(updatedChatRoom.members.has(newMember)).toBe(true);
    expect(updatedChatRoom.members.has(existingMember)).toBe(true);
  });

  test('should return error when operator is not a member of chat room', () => {
    const name = chatRoomNameFromString('No Operator Room')._unsafeUnwrap();
    const memberUserId = generateUserId();
    const operatorUserId = generateUserId(); // Different user, not a member
    const existingMember = createChatRoomMember({ userId: memberUserId });
    const chatRoom = createChatRoom({
      name,
      operatorUserId: memberUserId, // Create with memberUserId as operator
      initialMembers: new Set([existingMember]),
    })._unsafeUnwrap();
    const newMember = createChatRoomMember({ userId: generateUserId() });

    const result = addMemberToChatRoom(chatRoom, newMember, operatorUserId);

    expect(result.isErr()).toBe(true);
    const error = result._unsafeUnwrapErr();
    expect(error).toBeInstanceOf(ChatRoomOperatorNotMemberError);
    expect(error.message).toBe(
      'Operator must be a member of the ChatRoom to add members',
    );
  });

  test('should allow member to add another member when operator is valid member', () => {
    const name = chatRoomNameFromString('Valid Operator Room')._unsafeUnwrap();
    const operatorUserId = generateUserId();
    const anotherUserId = generateUserId();
    const operatorMember = createChatRoomMember({ userId: operatorUserId });
    const anotherMember = createChatRoomMember({ userId: anotherUserId });
    const chatRoom = createChatRoom({
      name,
      operatorUserId,
      initialMembers: new Set([operatorMember, anotherMember]),
    })._unsafeUnwrap();
    const newMember = createChatRoomMember({ userId: generateUserId() });

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