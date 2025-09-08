import { describe, expect, test } from 'vitest';
import { generateUserId } from '../user/userId';
import {
  addMemberToChatRoom,
  ChatRoomOperatorNotMemberError,
  createChatRoom,
  postMessage,
  removeMemberFromChatRoom,
} from './chatRoom';
import { createChatRoomMember } from './chatRoomMember';
import { createChatRoomMessage } from './chatRoomMessage';
import { chatRoomMessageContentFromString } from './chatRoomMessageContent';
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
      expect(chatRoom).toHaveProperty('messages');
      expect(Object.keys(chatRoom)).toHaveLength(4);
    });
  });

  describe('Complete chat room lifecycle scenario', () => {
    test('should handle member addition, message posting, member removal, and access control', () => {
      // 1. チャットルームを作成
      const chatRoomName = chatRoomNameFromString('Integration Test Room')._unsafeUnwrap();
      const operatorUserId = generateUserId();
      const operatorMember = createChatRoomMember({ userId: operatorUserId });
      
      let chatRoom = createChatRoom({
        name: chatRoomName,
        operatorUserId,
        initialMembers: new Set([operatorMember]),
      })._unsafeUnwrap();

      // 初期状態の検証
      expect(chatRoom.members.size).toBe(1);
      expect(chatRoom.messages).toHaveLength(0);
      expect(chatRoom.members.has(operatorMember)).toBe(true);

      // 2. メンバーを追加
      const newUserId = generateUserId();
      const newMember = createChatRoomMember({ userId: newUserId });
      
      const addMemberResult = addMemberToChatRoom(chatRoom, newMember, operatorUserId);
      expect(addMemberResult.isOk()).toBe(true);
      chatRoom = addMemberResult._unsafeUnwrap();

      // メンバー追加後の検証
      expect(chatRoom.members.size).toBe(2);
      expect(chatRoom.members.has(operatorMember)).toBe(true);
      expect(chatRoom.members.has(newMember)).toBe(true);

      // 3. 追加されたメンバーがメッセージを投稿
      const messageContent = chatRoomMessageContentFromString('Hello from new member!');
      const message = createChatRoomMessage({
        author: newMember,
        content: messageContent,
      });
      
      const postMessageResult = postMessage(chatRoom, message, newUserId);
      expect(postMessageResult.isOk()).toBe(true);
      chatRoom = postMessageResult._unsafeUnwrap();

      // メッセージ投稿後の検証
      expect(chatRoom.messages).toHaveLength(1);
      expect(chatRoom.messages[0]?.author).toBe(newMember);
      expect(chatRoom.messages[0]?.content).toBe(messageContent);

      // 4. メンバーを削除
      const removeMemberResult = removeMemberFromChatRoom(chatRoom, newMember, operatorUserId);
      expect(removeMemberResult.isOk()).toBe(true);
      chatRoom = removeMemberResult._unsafeUnwrap();

      // メンバー削除後の検証
      expect(chatRoom.members.size).toBe(1);
      expect(chatRoom.members.has(operatorMember)).toBe(true);
      expect(chatRoom.members.has(newMember)).toBe(false);
      // メッセージは削除されずに残っている
      expect(chatRoom.messages).toHaveLength(1);

      // 5. 削除されたメンバーはメッセージを投稿できない
      const secondMessage = createChatRoomMessage({
        author: newMember,
        content: chatRoomMessageContentFromString('This should fail'),
      });
      
      const failedPostResult = postMessage(chatRoom, secondMessage, newUserId);
      expect(failedPostResult.isErr()).toBe(true);
      const error = failedPostResult._unsafeUnwrapErr();
      expect(error).toBeInstanceOf(ChatRoomOperatorNotMemberError);
      expect(error.message).toBe('Operator must be a member of the ChatRoom to post messages');

      // 最終状態の検証
      expect(chatRoom.id).toBeDefined();
      expect(chatRoom.name).toBe(chatRoomName);
      expect(chatRoom.members.size).toBe(1);
      expect(chatRoom.members.has(operatorMember)).toBe(true);
      expect(chatRoom.members.has(newMember)).toBe(false);
      expect(chatRoom.messages).toHaveLength(1);
      expect(chatRoom.messages[0]?.author).toBe(newMember);
      expect(chatRoom.messages[0]?.content).toBe(messageContent);
    });
  });
});
