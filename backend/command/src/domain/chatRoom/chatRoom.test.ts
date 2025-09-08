import { describe, expect, test, vi } from 'vitest';
import {
  addMemberToChatRoom,
  ChatRoomMemberAlreadyExistsError,
  ChatRoomMemberNotFoundError,
  createChatRoom,
  removeMemberFromChatRoom,
} from './chatRoom';
import * as chatRoomIdModule from './chatRoomId';
import { type ChatRoomMember, createChatRoomMember } from './chatRoomMember';
import { chatRoomNameFromString } from './chatRoomName';
import { generateUserId } from '../user/userId';

describe('ChatRoom', () => {
  describe('createChatRoom', () => {
    test('should create a new ChatRoom with generated ID', () => {
      const name = chatRoomNameFromString('Test Room')._unsafeUnwrap();
      const member = createChatRoomMember({ userId: generateUserId() });
      const chatRoom = createChatRoom({
        name,
        initialMembers: new Set([member]),
      })._unsafeUnwrap();

      expect(chatRoom.id).toBeDefined();
      expect(chatRoom.id).toContain('room-');
      expect(chatRoom.name).toBe(name);
      expect(chatRoom.members).toBeDefined();
      expect(chatRoom.members).toBeInstanceOf(Set);
      expect(chatRoom.members.size).toBe(1);
    });

    test('should create different IDs for different chat rooms', () => {
      const name1 = chatRoomNameFromString('Room 1')._unsafeUnwrap();
      const name2 = chatRoomNameFromString('Room 2')._unsafeUnwrap();
      const member1 = createChatRoomMember({ userId: generateUserId() });
      const member2 = createChatRoomMember({ userId: generateUserId() });

      const chatRoom1 = createChatRoom({
        name: name1,
        initialMembers: new Set([member1]),
      })._unsafeUnwrap();
      const chatRoom2 = createChatRoom({
        name: name2,
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
      const member = createChatRoomMember({ userId: generateUserId() });
      const chatRoom = createChatRoom({
        name,
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
      const member = createChatRoomMember({ userId: generateUserId() });
      const chatRoom = createChatRoom({
        name,
        initialMembers: new Set([member]),
      })._unsafeUnwrap();

      expect(chatRoom.id).toBeDefined();
      expect(chatRoom.name).toBe(name);
      expect(chatRoom.members).toBeInstanceOf(Set);
    });

    test('should create chat room with special characters in name', () => {
      const name = chatRoomNameFromString('💬 General Chat #1')._unsafeUnwrap();
      const member = createChatRoomMember({ userId: generateUserId() });
      const chatRoom = createChatRoom({
        name,
        initialMembers: new Set([member]),
      })._unsafeUnwrap();

      expect(chatRoom.id).toBeDefined();
      expect(chatRoom.name).toBe(name);
      expect(chatRoom.members).toBeInstanceOf(Set);
    });

    test('should create chat room with max length name', () => {
      const maxLengthName = 'a'.repeat(256);
      const name = chatRoomNameFromString(maxLengthName)._unsafeUnwrap();
      const member = createChatRoomMember({ userId: generateUserId() });
      const chatRoom = createChatRoom({
        name,
        initialMembers: new Set([member]),
      })._unsafeUnwrap();

      expect(chatRoom.id).toBeDefined();
      expect(chatRoom.name).toBe(name);
      expect(chatRoom.members).toBeInstanceOf(Set);
    });
    test('should create chat room with initial members', () => {
      const name = chatRoomNameFromString('Test Room with Members')._unsafeUnwrap();
      const member1 = createChatRoomMember({ userId: generateUserId() });
      const member2 = createChatRoomMember({ userId: generateUserId() });
      const initialMembers = new Set([member1, member2]);

      const chatRoom = createChatRoom({
        name,
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
      const member1 = createChatRoomMember({ userId: generateUserId() });
      const member2 = createChatRoomMember({ userId: generateUserId() });
      const originalMembers = new Set([member1, member2]);

      const chatRoom = createChatRoom({
        name,
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
      const result = createChatRoom({
        name,
        initialMembers: emptyMembers,
      });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr().message).toBe('ChatRoom must have at least one member');
    });

    test('should create chat room with single member', () => {
      const name = chatRoomNameFromString('Single Member Room')._unsafeUnwrap();
      const member = createChatRoomMember({ userId: generateUserId() });
      const initialMembers = new Set([member]);

      const chatRoom = createChatRoom({
        name,
        initialMembers,
      })._unsafeUnwrap();

      expect(chatRoom.members.size).toBe(1);
      expect(chatRoom.members.has(member)).toBe(true);
    });
  });

  describe('addMemberToChatRoom', () => {
    test('should add a new member to chat room', () => {
      const name = chatRoomNameFromString('Test Room')._unsafeUnwrap();
      const initialMember = createChatRoomMember({ userId: generateUserId() });
      const chatRoom = createChatRoom({
        name,
        initialMembers: new Set([initialMember]),
      })._unsafeUnwrap();

      const newMember = createChatRoomMember({ userId: generateUserId() });
      const result = addMemberToChatRoom(chatRoom, newMember);

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
      const existingMember = createChatRoomMember({ userId: generateUserId() });
      const originalChatRoom = createChatRoom({
        name,
        initialMembers: new Set([existingMember]),
      })._unsafeUnwrap();
      const newMember = createChatRoomMember({ userId: generateUserId() });

      const result = addMemberToChatRoom(originalChatRoom, newMember);

      expect(result.isOk()).toBe(true);
      const updatedChatRoom = result._unsafeUnwrap();
      expect(originalChatRoom.members.size).toBe(1);
      expect(updatedChatRoom.members.size).toBe(2);
      expect(originalChatRoom.members).not.toBe(updatedChatRoom.members);
    });

    test('should return error when adding duplicate member', () => {
      const name = chatRoomNameFromString('Duplicate Test Room')._unsafeUnwrap();
      const member = createChatRoomMember({ userId: generateUserId() });
      const chatRoom = createChatRoom({
        name,
        initialMembers: new Set([member]),
      })._unsafeUnwrap();

      const result = addMemberToChatRoom(chatRoom, member);

      expect(result.isErr()).toBe(true);
      const error = result._unsafeUnwrapErr();
      expect(error).toBeInstanceOf(ChatRoomMemberAlreadyExistsError);
      expect(error.message).toBe(
        'ChatRoomMember already exists in the ChatRoom',
      );
    });

    test('should add member to existing chat room', () => {
      const name = chatRoomNameFromString('Existing Room')._unsafeUnwrap();
      const existingMember = createChatRoomMember({ userId: generateUserId() });
      const chatRoom = createChatRoom({
        name,
        initialMembers: new Set([existingMember]),
      })._unsafeUnwrap();
      const newMember = createChatRoomMember({ userId: generateUserId() });

      const result = addMemberToChatRoom(chatRoom, newMember);

      expect(result.isOk()).toBe(true);
      const updatedChatRoom = result._unsafeUnwrap();
      expect(updatedChatRoom.members.size).toBe(2);
      expect(updatedChatRoom.members.has(newMember)).toBe(true);
      expect(updatedChatRoom.members.has(existingMember)).toBe(true);
    });
  });

  describe('removeMemberFromChatRoom', () => {
    test('should remove existing member from chat room', () => {
      const name = chatRoomNameFromString('Test Room')._unsafeUnwrap();
      const member1 = createChatRoomMember({ userId: generateUserId() });
      const member2 = createChatRoomMember({ userId: generateUserId() });
      const chatRoom = createChatRoom({
        name,
        initialMembers: new Set([member1, member2]),
      })._unsafeUnwrap();

      const result = removeMemberFromChatRoom(chatRoom, member1);

      expect(result.isOk()).toBe(true);
      const updatedChatRoom = result._unsafeUnwrap();
      expect(updatedChatRoom.members.size).toBe(1);
      expect(updatedChatRoom.members.has(member1)).toBe(false);
      expect(updatedChatRoom.members.has(member2)).toBe(true);
      expect(updatedChatRoom.id).toBe(chatRoom.id);
      expect(updatedChatRoom.name).toBe(chatRoom.name);
    });

    test('should not modify original chat room', () => {
      const name = chatRoomNameFromString('Original Room')._unsafeUnwrap();
      const member = createChatRoomMember({ userId: generateUserId() });
      const originalChatRoom = createChatRoom({
        name,
        initialMembers: new Set([member]),
      })._unsafeUnwrap();

      const result = removeMemberFromChatRoom(originalChatRoom, member);

      expect(result.isOk()).toBe(true);
      const updatedChatRoom = result._unsafeUnwrap();
      expect(originalChatRoom.members.size).toBe(1);
      expect(updatedChatRoom.members.size).toBe(0);
      expect(originalChatRoom.members).not.toBe(updatedChatRoom.members);
    });

    test('should return error when removing non-existing member', () => {
      const name = chatRoomNameFromString('Non-existing Test Room')._unsafeUnwrap();
      const existingMember = createChatRoomMember({ userId: generateUserId() });
      const nonExistingMember = createChatRoomMember({ userId: generateUserId() });
      const chatRoom = createChatRoom({
        name,
        initialMembers: new Set([existingMember]),
      })._unsafeUnwrap();

      const result = removeMemberFromChatRoom(chatRoom, nonExistingMember);

      expect(result.isErr()).toBe(true);
      const error = result._unsafeUnwrapErr();
      expect(error).toBeInstanceOf(ChatRoomMemberNotFoundError);
      expect(error.message).toBe(
        'ChatRoomMember not found in the ChatRoom',
      );
    });

    test('should remove member from chat room with single member', () => {
      const name = chatRoomNameFromString('Single Member Room')._unsafeUnwrap();
      const member = createChatRoomMember({ userId: generateUserId() });
      const chatRoom = createChatRoom({
        name,
        initialMembers: new Set([member]),
      })._unsafeUnwrap();

      const result = removeMemberFromChatRoom(chatRoom, member);

      expect(result.isOk()).toBe(true);
      const updatedChatRoom = result._unsafeUnwrap();
      expect(updatedChatRoom.members.size).toBe(0);
      expect(updatedChatRoom.members.has(member)).toBe(false);
    });

    test('should return error when removing member from chat room without that member', () => {
      const name = chatRoomNameFromString('Room Without Member')._unsafeUnwrap();
      const existingMember = createChatRoomMember({ userId: generateUserId() });
      const chatRoom = createChatRoom({
        name,
        initialMembers: new Set([existingMember]),
      })._unsafeUnwrap();
      const member = createChatRoomMember({ userId: generateUserId() });

      const result = removeMemberFromChatRoom(chatRoom, member);

      expect(result.isErr()).toBe(true);
      const error = result._unsafeUnwrapErr();
      expect(error).toBeInstanceOf(ChatRoomMemberNotFoundError);
      expect(error.message).toBe(
        'ChatRoomMember not found in the ChatRoom',
      );
    });
  });

  describe('ChatRoom type', () => {
    test('should have correct structure', () => {
      const name = chatRoomNameFromString('Type Test Room')._unsafeUnwrap();
      const member = createChatRoomMember({ userId: generateUserId() });
      const chatRoom = createChatRoom({
        name,
        initialMembers: new Set([member]),
      })._unsafeUnwrap();

      expect(chatRoom).toHaveProperty('id');
      expect(chatRoom).toHaveProperty('name');
      expect(chatRoom).toHaveProperty('members');
      expect(Object.keys(chatRoom)).toHaveLength(3);
    });
  });
});
