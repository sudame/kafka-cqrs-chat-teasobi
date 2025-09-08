import { describe, expect, test, vi } from 'vitest';
import { generateUserId } from '../../user/userId';
import {
  CreateChatRoomOperatorNotInMembersError,
  createChatRoom,
} from '../chatRoom';
import * as chatRoomIdModule from '../chatRoomId';
import { createChatRoomMember } from '../chatRoomMember';
import { chatRoomNameFromString } from '../chatRoomName';
import { aChatRoom, aChatRoomMember } from './testHelpers';

describe('createChatRoom', () => {
  test('should create a new ChatRoom with generated ID', () => {
    const chatRoom = aChatRoom().buildUnsafe();

    expect(chatRoom.id).toBeDefined();
    expect(chatRoom.id).toContain('room-');
    expect(chatRoom.name).toBeDefined();
    expect(chatRoom.members).toBeDefined();
    expect(chatRoom.members).toBeInstanceOf(Set);
    expect(chatRoom.members.size).toBe(1);
    expect(chatRoom.messages).toBeDefined();
    expect(chatRoom.messages).toBeInstanceOf(Array);
    expect(chatRoom.messages.length).toBe(0);
  });

  test('should create different IDs for different chat rooms', () => {
    const chatRoom1 = aChatRoom().withName('Room 1').buildUnsafe();
    const chatRoom2 = aChatRoom().withName('Room 2').buildUnsafe();

    expect(chatRoom1.id).not.toBe(chatRoom2.id);
    expect(chatRoom1.name).not.toBe(chatRoom2.name);
    expect(chatRoom1.members).toBeInstanceOf(Set);
    expect(chatRoom2.members).toBeInstanceOf(Set);
  });

  test('should use generateChatRoomId to create ID', () => {
    const mockId =
      'room-01F8MECHZX3TBDSZ7XRADM79XE' as chatRoomIdModule.ChatRoomId;
    const generateSpy = vi.spyOn(chatRoomIdModule, 'generateChatRoomId');
    generateSpy.mockReturnValue(mockId);

    const chatRoom = aChatRoom().withName('Mock Room').buildUnsafe();

    expect(generateSpy).toHaveBeenCalledOnce();
    expect(chatRoom.id).toBe(mockId);
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
    const userId1 = generateUserId();
    const userId2 = generateUserId();
    const member1 = aChatRoomMember().withUserId(userId1).build();
    const member2 = aChatRoomMember().withUserId(userId2).build();

    const chatRoom = aChatRoom()
      .withName('Test Room with Members')
      .withOperatorUserId(userId1)
      .withMembers(member1, member2)
      .buildUnsafe();

    expect(chatRoom.id).toBeDefined();
    expect(chatRoom.members).toBeInstanceOf(Set);
    expect(chatRoom.members.size).toBe(2);
    expect(chatRoom.members.has(member1)).toBe(true);
    expect(chatRoom.members.has(member2)).toBe(true);
  });


  test('should return error for empty initial members set', () => {
    const result = aChatRoom()
      .withName('Empty Room')
      .withMembers() // 空のメンバー配列
      .withOperatorNotInMembers() // オペレーターも自動追加しない
      .build();

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().message).toBe(
      'ChatRoom must have at least one member',
    );
  });

  test('should create chat room with single member', () => {
    const chatRoom = aChatRoom()
      .withName('Single Member Room')
      .buildUnsafe();

    expect(chatRoom.members.size).toBe(1);
  });

  describe('operator constraints', () => {
    test('should create chat room when operator is in initial members', () => {
      const operatorUserId = generateUserId();
      const otherUserId = generateUserId();
      const operatorMember = aChatRoomMember().withUserId(operatorUserId).build();
      const otherMember = aChatRoomMember().withUserId(otherUserId).build();

      const chatRoom = aChatRoom()
        .withName('Operator Test Room')
        .withOperatorUserId(operatorUserId)
        .withMembers(operatorMember, otherMember)
        .buildUnsafe();

      expect(chatRoom.id).toBeDefined();
      expect(chatRoom.members.size).toBe(2);
      expect(chatRoom.members.has(operatorMember)).toBe(true);
      expect(chatRoom.members.has(otherMember)).toBe(true);
    });

    test('should return error when operator is not in initial members', () => {
      const operatorUserId = generateUserId();
      const memberUserId = generateUserId();
      const member = aChatRoomMember().withUserId(memberUserId).build();

      const result = aChatRoom()
        .withName('Invalid Operator Room')
        .withOperatorUserId(operatorUserId)
        .withMembers(member)
        .build();

      expect(result.isErr()).toBe(true);
      const error = result._unsafeUnwrapErr();
      expect(error).toBeInstanceOf(CreateChatRoomOperatorNotInMembersError);
      expect(error.message).toBe(
        'Operator user must be included in initial members',
      );
    });

    test('should create single member chat room with operator as only member', () => {
      const operatorUserId = generateUserId();
      const operatorMember = aChatRoomMember().withUserId(operatorUserId).build();

      const chatRoom = aChatRoom()
        .withName('Single Operator Room')
        .withOperatorUserId(operatorUserId)
        .withMembers(operatorMember)
        .buildUnsafe();

      expect(chatRoom.id).toBeDefined();
      expect(chatRoom.members.size).toBe(1);
      expect(chatRoom.members.has(operatorMember)).toBe(true);
    });
  });
});