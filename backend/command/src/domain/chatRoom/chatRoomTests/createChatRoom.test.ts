import { describe, expect, test, vi } from 'vitest';
import { generateUserId } from '../../user/userId';
import {
  CreateChatRoomOperatorNotInMembersError,
  createChatRoom,
} from '../chatRoom';
import * as chatRoomIdModule from '../chatRoomId';
import { type ChatRoomMember, createChatRoomMember } from '../chatRoomMember';
import { chatRoomNameFromString } from '../chatRoomName';

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

  test('should create chat room with various name formats', () => {
    const testCases = [
      { name: '開発チーム', description: 'Japanese name' },
      { name: '💬 General Chat #1', description: 'special characters' },
    ];

    for (const testCase of testCases) {
      const name = chatRoomNameFromString(testCase.name)._unsafeUnwrap();
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
    }
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