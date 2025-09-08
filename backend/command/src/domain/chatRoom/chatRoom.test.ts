import { describe, expect, test, vi } from 'vitest';
import { createChatRoom } from './chatRoom';
import * as chatRoomIdModule from './chatRoomId';
import { type ChatRoomMember, createChatRoomMember } from './chatRoomMember';
import { chatRoomNameFromString } from './chatRoomName';

describe('ChatRoom', () => {
  describe('createChatRoom', () => {
    test('should create a new ChatRoom with generated ID', () => {
      const nameResult = chatRoomNameFromString('Test Room');
      expect(nameResult.isOk()).toBe(true);

      if (nameResult.isOk()) {
        const chatRoom = createChatRoom({
          name: nameResult.value,
          initialMembers: new Set<ChatRoomMember>(),
        });

        expect(chatRoom.id).toBeDefined();
        expect(chatRoom.id).toContain('room-');
        expect(chatRoom.name).toBe(nameResult.value);
        expect(chatRoom.members).toBeDefined();
        expect(chatRoom.members).toBeInstanceOf(Set);
        expect(chatRoom.members.size).toBe(0);
      }
    });

    test('should create different IDs for different chat rooms', () => {
      const nameResult1 = chatRoomNameFromString('Room 1');
      const nameResult2 = chatRoomNameFromString('Room 2');

      expect(nameResult1.isOk()).toBe(true);
      expect(nameResult2.isOk()).toBe(true);

      if (nameResult1.isOk() && nameResult2.isOk()) {
        const chatRoom1 = createChatRoom({
          name: nameResult1.value,
          initialMembers: new Set(),
        });
        const chatRoom2 = createChatRoom({
          name: nameResult2.value,
          initialMembers: new Set(),
        });

        expect(chatRoom1.id).not.toBe(chatRoom2.id);
        expect(chatRoom1.name).toBe(nameResult1.value);
        expect(chatRoom2.name).toBe(nameResult2.value);
        expect(chatRoom1.members).toBeInstanceOf(Set);
        expect(chatRoom2.members).toBeInstanceOf(Set);
      }
    });

    test('should use generateChatRoomId to create ID', () => {
      const mockId =
        'room-01F8MECHZX3TBDSZ7XRADM79XE' as chatRoomIdModule.ChatRoomId;
      const generateSpy = vi.spyOn(chatRoomIdModule, 'generateChatRoomId');
      generateSpy.mockReturnValue(mockId);

      const nameResult = chatRoomNameFromString('Mock Room');
      expect(nameResult.isOk()).toBe(true);

      if (nameResult.isOk()) {
        const chatRoom = createChatRoom({
          name: nameResult.value,
          initialMembers: new Set<ChatRoomMember>(),
        });

        expect(generateSpy).toHaveBeenCalledOnce();
        expect(chatRoom.id).toBe(mockId);
        expect(chatRoom.name).toBe(nameResult.value);
        expect(chatRoom.members).toBeInstanceOf(Set);
      }

      generateSpy.mockRestore();
    });

    test('should create chat room with Japanese name', () => {
      const nameResult = chatRoomNameFromString('開発チーム');
      expect(nameResult.isOk()).toBe(true);

      if (nameResult.isOk()) {
        const chatRoom = createChatRoom({
          name: nameResult.value,
          initialMembers: new Set<ChatRoomMember>(),
        });

        expect(chatRoom.id).toBeDefined();
        expect(chatRoom.name).toBe(nameResult.value);
        expect(chatRoom.members).toBeInstanceOf(Set);
      }
    });

    test('should create chat room with special characters in name', () => {
      const nameResult = chatRoomNameFromString('💬 General Chat #1');
      expect(nameResult.isOk()).toBe(true);

      if (nameResult.isOk()) {
        const chatRoom = createChatRoom({
          name: nameResult.value,
          initialMembers: new Set<ChatRoomMember>(),
        });

        expect(chatRoom.id).toBeDefined();
        expect(chatRoom.name).toBe(nameResult.value);
        expect(chatRoom.members).toBeInstanceOf(Set);
      }
    });

    test('should create chat room with max length name', () => {
      const maxLengthName = 'a'.repeat(256);
      const nameResult = chatRoomNameFromString(maxLengthName);
      expect(nameResult.isOk()).toBe(true);

      if (nameResult.isOk()) {
        const chatRoom = createChatRoom({
          name: nameResult.value,
          initialMembers: new Set<ChatRoomMember>(),
        });

        expect(chatRoom.id).toBeDefined();
        expect(chatRoom.name).toBe(nameResult.value);
        expect(chatRoom.members).toBeInstanceOf(Set);
      }
    });
    test('should create chat room with initial members', () => {
      const nameResult = chatRoomNameFromString('Test Room with Members');
      expect(nameResult.isOk()).toBe(true);

      if (nameResult.isOk()) {
        const member1 = createChatRoomMember();
        const member2 = createChatRoomMember();
        const initialMembers = new Set([member1, member2]);

        const chatRoom = createChatRoom({
          name: nameResult.value,
          initialMembers,
        });

        expect(chatRoom.id).toBeDefined();
        expect(chatRoom.name).toBe(nameResult.value);
        expect(chatRoom.members).toBeInstanceOf(Set);
        expect(chatRoom.members.size).toBe(2);
        expect(chatRoom.members.has(member1)).toBe(true);
        expect(chatRoom.members.has(member2)).toBe(true);
      }
    });

    test('should create separate member sets for each chat room', () => {
      const nameResult = chatRoomNameFromString('Isolated Room');
      expect(nameResult.isOk()).toBe(true);

      if (nameResult.isOk()) {
        const member1 = createChatRoomMember();
        const member2 = createChatRoomMember();
        const originalMembers = new Set([member1, member2]);

        const chatRoom = createChatRoom({
          name: nameResult.value,
          initialMembers: originalMembers,
        });

        // originalMembersに新しいメンバーを追加
        const member3 = createChatRoomMember();
        originalMembers.add(member3);

        // chatRoomのmembersは影響を受けないことを確認
        expect(chatRoom.members.size).toBe(2);
        expect(chatRoom.members.has(member3)).toBe(false);
        expect(originalMembers.size).toBe(3);
      }
    });

    test('should handle empty initial members set', () => {
      const nameResult = chatRoomNameFromString('Empty Room');
      expect(nameResult.isOk()).toBe(true);

      if (nameResult.isOk()) {
        const emptyMembers = new Set<ChatRoomMember>();
        const chatRoom = createChatRoom({
          name: nameResult.value,
          initialMembers: emptyMembers,
        });

        expect(chatRoom.members).toBeInstanceOf(Set);
        expect(chatRoom.members.size).toBe(0);
        expect(chatRoom.members).not.toBe(emptyMembers);
      }
    });

    test('should create chat room with single member', () => {
      const nameResult = chatRoomNameFromString('Single Member Room');
      expect(nameResult.isOk()).toBe(true);

      if (nameResult.isOk()) {
        const member = createChatRoomMember();
        const initialMembers = new Set([member]);

        const chatRoom = createChatRoom({
          name: nameResult.value,
          initialMembers,
        });

        expect(chatRoom.members.size).toBe(1);
        expect(chatRoom.members.has(member)).toBe(true);
      }
    });
  });

  describe('ChatRoom type', () => {
    test('should have correct structure', () => {
      const nameResult = chatRoomNameFromString('Type Test Room');
      expect(nameResult.isOk()).toBe(true);

      if (nameResult.isOk()) {
        const chatRoom = createChatRoom({
          name: nameResult.value,
          initialMembers: new Set<ChatRoomMember>(),
        });

        expect(chatRoom).toHaveProperty('id');
        expect(chatRoom).toHaveProperty('name');
        expect(chatRoom).toHaveProperty('members');
        expect(Object.keys(chatRoom)).toHaveLength(3);
      }
    });
  });
});
