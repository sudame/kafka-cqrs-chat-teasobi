import { describe, expect, test } from 'vitest';
import { generateUserId } from '../user/userId';
import {
  addMemberToChatRoom,
  createChatRoom,
  removeMemberFromChatRoom,
} from './chatRoom';
import { createChatRoomMember } from './chatRoomMember';
import { chatRoomNameFromString } from './chatRoomName';

describe('ChatRoom integration tests', () => {
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
      expect(Object.keys(chatRoom)).toHaveLength(3);
    });
  });

  describe('Complete chat room lifecycle scenario', () => {
    test('should handle member addition and removal with access control', () => {
      // 1. チャットルームを作成
      const chatRoomName = chatRoomNameFromString(
        'Integration Test Room',
      )._unsafeUnwrap();
      const operatorUserId = generateUserId();
      const operatorMember = createChatRoomMember({ userId: operatorUserId });

      let chatRoom = createChatRoom({
        name: chatRoomName,
        operatorUserId,
        initialMembers: new Set([operatorMember]),
      })._unsafeUnwrap();

      // 初期状態の検証
      expect(chatRoom.members.size).toBe(1);
      expect(chatRoom.members.has(operatorMember)).toBe(true);

      // 2. メンバーを追加
      const newUserId = generateUserId();
      const newMember = createChatRoomMember({ userId: newUserId });

      const addMemberResult = addMemberToChatRoom(
        chatRoom,
        newMember,
        operatorUserId,
      );
      expect(addMemberResult.isOk()).toBe(true);
      chatRoom = addMemberResult._unsafeUnwrap();

      // メンバー追加後の検証
      expect(chatRoom.members.size).toBe(2);
      expect(chatRoom.members.has(operatorMember)).toBe(true);
      expect(chatRoom.members.has(newMember)).toBe(true);

      // 3. メンバーを削除
      const removeMemberResult = removeMemberFromChatRoom(
        chatRoom,
        newMember,
        operatorUserId,
      );
      expect(removeMemberResult.isOk()).toBe(true);
      chatRoom = removeMemberResult._unsafeUnwrap();

      // メンバー削除後の検証
      expect(chatRoom.members.size).toBe(1);
      expect(chatRoom.members.has(operatorMember)).toBe(true);
      expect(chatRoom.members.has(newMember)).toBe(false);

      // 最終状態の検証
      expect(chatRoom.id).toBeDefined();
      expect(chatRoom.name).toBe(chatRoomName);
      expect(chatRoom.members.size).toBe(1);
      expect(chatRoom.members.has(operatorMember)).toBe(true);
      expect(chatRoom.members.has(newMember)).toBe(false);
    });
  });
});
