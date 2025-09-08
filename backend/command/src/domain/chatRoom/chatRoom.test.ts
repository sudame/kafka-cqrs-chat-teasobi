import { describe, expect, test, vi } from 'vitest';
import { generateUserId } from '../user/userId';
import {
  addMemberToChatRoom,
  ChatRoomCannotRemoveSelfError,
  ChatRoomMemberAlreadyExistsError,
  ChatRoomMemberNotFoundError,
  ChatRoomOperatorNotMemberError,
  CreateChatRoomOperatorNotInMembersError,
  createChatRoom,
  removeMemberFromChatRoom,
} from './chatRoom';
import * as chatRoomIdModule from './chatRoomId';
import { type ChatRoomMember, createChatRoomMember } from './chatRoomMember';
import { chatRoomNameFromString } from './chatRoomName';

describe('ChatRoom', () => {
  describe('createChatRoom', () => {
    test('should create a new ChatRoom with generated ID', () => {
      const name = chatRoomNameFromString('Test Room')._unsafeUnwrap();
      const userId = generateUserId();
      const member = createChatRoomMember({ userId });
      const chatRoom = createChatRoom({
        name,
        operatorUserId: userId,
        initialMembers: new Set([member]),
      })._unsafeUnwrap();

      expect(chatRoom.id).toBeDefined();
      expect(chatRoom.id).toContain('room-');
      expect(chatRoom.name).toBe(name);
      expect(chatRoom.members).toBeDefined();
      expect(chatRoom.members).toBeInstanceOf(Set);
      expect(chatRoom.members.size).toBe(1);
      expect(chatRoom.messages).toBeDefined();
      expect(chatRoom.messages).toBeInstanceOf(Array);
      expect(chatRoom.messages.length).toBe(0);
    });

    test('should create different IDs for different chat rooms', () => {
      const name1 = chatRoomNameFromString('Room 1')._unsafeUnwrap();
      const name2 = chatRoomNameFromString('Room 2')._unsafeUnwrap();
      const userId1 = generateUserId();
      const userId2 = generateUserId();
      const member1 = createChatRoomMember({ userId: userId1 });
      const member2 = createChatRoomMember({ userId: userId2 });

      const chatRoom1 = createChatRoom({
        name: name1,
        operatorUserId: userId1,
        initialMembers: new Set([member1]),
      })._unsafeUnwrap();
      const chatRoom2 = createChatRoom({
        name: name2,
        operatorUserId: userId2,
        initialMembers: new Set([member2]),
      })._unsafeUnwrap();

      expect(chatRoom1.id).not.toBe(chatRoom2.id);
      expect(chatRoom1.name).toBe(name1);
      expect(chatRoom2.name).toBe(name2);
      expect(chatRoom1.members).toBeInstanceOf(Set);
      expect(chatRoom2.members).toBeInstanceOf(Set);
    });

    test('should use generateChatRoomId to create ID', () => {
      const mockId =
        'room-01F8MECHZX3TBDSZ7XRADM79XE' as chatRoomIdModule.ChatRoomId;
      const generateSpy = vi.spyOn(chatRoomIdModule, 'generateChatRoomId');
      generateSpy.mockReturnValue(mockId);

      const name = chatRoomNameFromString('Mock Room')._unsafeUnwrap();
      const userId = generateUserId();
      const member = createChatRoomMember({ userId });
      const chatRoom = createChatRoom({
        name,
        operatorUserId: userId,
        initialMembers: new Set([member]),
      })._unsafeUnwrap();

      expect(generateSpy).toHaveBeenCalledOnce();
      expect(chatRoom.id).toBe(mockId);
      expect(chatRoom.name).toBe(name);
      expect(chatRoom.members).toBeInstanceOf(Set);

      generateSpy.mockRestore();
    });

    test('should create chat room with Japanese name', () => {
      const name = chatRoomNameFromString('開発チーム')._unsafeUnwrap();
      const userId = generateUserId();
      const member = createChatRoomMember({ userId });
      const chatRoom = createChatRoom({
        name,
        operatorUserId: userId,
        initialMembers: new Set([member]),
      })._unsafeUnwrap();

      expect(chatRoom.id).toBeDefined();
      expect(chatRoom.name).toBe(name);
      expect(chatRoom.members).toBeInstanceOf(Set);
    });

    test('should create chat room with special characters in name', () => {
      const name = chatRoomNameFromString('💬 General Chat #1')._unsafeUnwrap();
      const userId = generateUserId();
      const member = createChatRoomMember({ userId });
      const chatRoom = createChatRoom({
        name,
        operatorUserId: userId,
        initialMembers: new Set([member]),
      })._unsafeUnwrap();

      expect(chatRoom.id).toBeDefined();
      expect(chatRoom.name).toBe(name);
      expect(chatRoom.members).toBeInstanceOf(Set);
    });

    test('should create chat room with max length name', () => {
      const maxLengthName = 'a'.repeat(256);
      const name = chatRoomNameFromString(maxLengthName)._unsafeUnwrap();
      const userId = generateUserId();
      const member = createChatRoomMember({ userId });
      const chatRoom = createChatRoom({
        name,
        operatorUserId: userId,
        initialMembers: new Set([member]),
      })._unsafeUnwrap();

      expect(chatRoom.id).toBeDefined();
      expect(chatRoom.name).toBe(name);
      expect(chatRoom.members).toBeInstanceOf(Set);
    });
    test('should create chat room with initial members', () => {
      const name = chatRoomNameFromString(
        'Test Room with Members',
      )._unsafeUnwrap();
      const userId1 = generateUserId();
      const userId2 = generateUserId();
      const member1 = createChatRoomMember({ userId: userId1 });
      const member2 = createChatRoomMember({ userId: userId2 });
      const initialMembers = new Set([member1, member2]);

      const chatRoom = createChatRoom({
        name,
        operatorUserId: userId1,
        initialMembers,
      })._unsafeUnwrap();

      expect(chatRoom.id).toBeDefined();
      expect(chatRoom.name).toBe(name);
      expect(chatRoom.members).toBeInstanceOf(Set);
      expect(chatRoom.members.size).toBe(2);
      expect(chatRoom.members.has(member1)).toBe(true);
      expect(chatRoom.members.has(member2)).toBe(true);
    });

    test('should create separate member sets for each chat room', () => {
      const name = chatRoomNameFromString('Isolated Room')._unsafeUnwrap();
      const userId1 = generateUserId();
      const userId2 = generateUserId();
      const member1 = createChatRoomMember({ userId: userId1 });
      const member2 = createChatRoomMember({ userId: userId2 });
      const originalMembers = new Set([member1, member2]);

      const chatRoom = createChatRoom({
        name,
        operatorUserId: userId1,
        initialMembers: originalMembers,
      })._unsafeUnwrap();

      // originalMembersに新しいメンバーを追加
      const member3 = createChatRoomMember({ userId: generateUserId() });
      originalMembers.add(member3);

      // chatRoomのmembersは影響を受けないことを確認
      expect(chatRoom.members.size).toBe(2);
      expect(chatRoom.members.has(member3)).toBe(false);
      expect(originalMembers.size).toBe(3);
    });

    test('should return error for empty initial members set', () => {
      const name = chatRoomNameFromString('Empty Room')._unsafeUnwrap();
      const emptyMembers = new Set<ChatRoomMember>();
      const operatorUserId = generateUserId();
      const result = createChatRoom({
        name,
        operatorUserId,
        initialMembers: emptyMembers,
      });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr().message).toBe(
        'ChatRoom must have at least one member',
      );
    });

    test('should create chat room with single member', () => {
      const name = chatRoomNameFromString('Single Member Room')._unsafeUnwrap();
      const userId = generateUserId();
      const member = createChatRoomMember({ userId });
      const initialMembers = new Set([member]);

      const chatRoom = createChatRoom({
        name,
        operatorUserId: userId,
        initialMembers,
      })._unsafeUnwrap();

      expect(chatRoom.members.size).toBe(1);
      expect(chatRoom.members.has(member)).toBe(true);
    });
  });

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

    test('should return error when removing member from chat room without that member', () => {
      const name = chatRoomNameFromString(
        'Room Without Member',
      )._unsafeUnwrap();
      const userId = generateUserId();
      const existingMember = createChatRoomMember({ userId });
      const chatRoom = createChatRoom({
        name,
        operatorUserId: userId,
        initialMembers: new Set([existingMember]),
      })._unsafeUnwrap();
      const member = createChatRoomMember({ userId: generateUserId() });

      const result = removeMemberFromChatRoom(chatRoom, member, userId);

      expect(result.isErr()).toBe(true);
      const error = result._unsafeUnwrapErr();
      expect(error).toBeInstanceOf(ChatRoomMemberNotFoundError);
      expect(error.message).toBe('ChatRoomMember not found in the ChatRoom');
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

  describe('ChatRoom type', () => {
    test('should have correct structure', () => {
      const name = chatRoomNameFromString('Type Test Room')._unsafeUnwrap();
      const userId = generateUserId();
      const member = createChatRoomMember({ userId });
      const chatRoom = createChatRoom({
        name,
        operatorUserId: userId,
        initialMembers: new Set([member]),
      })._unsafeUnwrap();

      expect(chatRoom).toHaveProperty('id');
      expect(chatRoom).toHaveProperty('name');
      expect(chatRoom).toHaveProperty('members');
      expect(chatRoom).toHaveProperty('messages');
      expect(Object.keys(chatRoom)).toHaveLength(4);
    });
  });

  describe('operator constraints', () => {
    test('should create chat room when operator is in initial members', () => {
      const name = chatRoomNameFromString('Operator Test Room')._unsafeUnwrap();
      const operatorUserId = generateUserId();
      const otherUserId = generateUserId();
      const operatorMember = createChatRoomMember({ userId: operatorUserId });
      const otherMember = createChatRoomMember({ userId: otherUserId });

      const chatRoom = createChatRoom({
        name,
        operatorUserId,
        initialMembers: new Set([operatorMember, otherMember]),
      })._unsafeUnwrap();

      expect(chatRoom.id).toBeDefined();
      expect(chatRoom.name).toBe(name);
      expect(chatRoom.members.size).toBe(2);
      expect(chatRoom.members.has(operatorMember)).toBe(true);
      expect(chatRoom.members.has(otherMember)).toBe(true);
    });

    test('should return error when operator is not in initial members', () => {
      const name = chatRoomNameFromString(
        'Invalid Operator Room',
      )._unsafeUnwrap();
      const operatorUserId = generateUserId();
      const memberUserId = generateUserId();
      const member = createChatRoomMember({ userId: memberUserId });

      const result = createChatRoom({
        name,
        operatorUserId,
        initialMembers: new Set([member]),
      });

      expect(result.isErr()).toBe(true);
      const error = result._unsafeUnwrapErr();
      expect(error).toBeInstanceOf(CreateChatRoomOperatorNotInMembersError);
      expect(error.message).toBe(
        'Operator user must be included in initial members',
      );
    });

    test('should create single member chat room with operator as only member', () => {
      const name = chatRoomNameFromString(
        'Single Operator Room',
      )._unsafeUnwrap();
      const operatorUserId = generateUserId();
      const operatorMember = createChatRoomMember({ userId: operatorUserId });

      const chatRoom = createChatRoom({
        name,
        operatorUserId,
        initialMembers: new Set([operatorMember]),
      })._unsafeUnwrap();

      expect(chatRoom.id).toBeDefined();
      expect(chatRoom.name).toBe(name);
      expect(chatRoom.members.size).toBe(1);
      expect(chatRoom.members.has(operatorMember)).toBe(true);
    });
  });
});
