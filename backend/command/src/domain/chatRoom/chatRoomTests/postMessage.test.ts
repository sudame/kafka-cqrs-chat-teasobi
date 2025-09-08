import { describe, expect, test } from 'vitest';
import { generateUserId } from '../../user/userId';
import {
  ChatRoomMessageAuthorMismatchError,
  ChatRoomOperatorNotMemberError,
  createChatRoom,
  postMessage,
} from '../chatRoom';
import { createChatRoomMember } from '../chatRoomMember';
import { createChatRoomMessage } from '../chatRoomMessage';
import { chatRoomMessageContentFromString } from '../chatRoomMessageContent';
import { chatRoomNameFromString } from '../chatRoomName';

describe('postMessage', () => {
  test('should add message to chat room when operator is author and member', () => {
    const name = chatRoomNameFromString('Test Room')._unsafeUnwrap();
    const userId = generateUserId();
    const member = createChatRoomMember({ userId });
    const chatRoom = createChatRoom({
      name,
      operatorUserId: userId,
      initialMembers: new Set([member]),
    })._unsafeUnwrap();

    const messageContent = chatRoomMessageContentFromString('Hello, world!');
    const message = createChatRoomMessage({
      author: member,
      content: messageContent,
    });

    const result = postMessage(chatRoom, message, userId);

    expect(result.isOk()).toBe(true);
    const updatedChatRoom = result._unsafeUnwrap();
    expect(updatedChatRoom.messages).toHaveLength(1);
    expect(updatedChatRoom.messages[0]).toBe(message);
    expect(updatedChatRoom.id).toBe(chatRoom.id);
    expect(updatedChatRoom.name).toBe(chatRoom.name);
    expect(updatedChatRoom.members).toBe(chatRoom.members);
  });

  test('should not modify original chat room messages', () => {
    const name = chatRoomNameFromString('Original Room')._unsafeUnwrap();
    const userId = generateUserId();
    const member = createChatRoomMember({ userId });
    const originalChatRoom = createChatRoom({
      name,
      operatorUserId: userId,
      initialMembers: new Set([member]),
    })._unsafeUnwrap();

    const messageContent = chatRoomMessageContentFromString('Test message');
    const message = createChatRoomMessage({
      author: member,
      content: messageContent,
    });

    const result = postMessage(originalChatRoom, message, userId);

    expect(result.isOk()).toBe(true);
    const updatedChatRoom = result._unsafeUnwrap();
    expect(originalChatRoom.messages).toHaveLength(0);
    expect(updatedChatRoom.messages).toHaveLength(1);
    expect(originalChatRoom.messages).not.toBe(updatedChatRoom.messages);
  });

  test('should add multiple messages sequentially', () => {
    const name = chatRoomNameFromString('Multiple Messages Room')._unsafeUnwrap();
    const userId = generateUserId();
    const member = createChatRoomMember({ userId });
    let chatRoom = createChatRoom({
      name,
      operatorUserId: userId,
      initialMembers: new Set([member]),
    })._unsafeUnwrap();

    const message1Content = chatRoomMessageContentFromString('First message');
    const message1 = createChatRoomMessage({
      author: member,
      content: message1Content,
    });

    const result1 = postMessage(chatRoom, message1, userId);
    expect(result1.isOk()).toBe(true);
    chatRoom = result1._unsafeUnwrap();

    const message2Content = chatRoomMessageContentFromString('Second message');
    const message2 = createChatRoomMessage({
      author: member,
      content: message2Content,
    });

    const result2 = postMessage(chatRoom, message2, userId);
    expect(result2.isOk()).toBe(true);
    const finalChatRoom = result2._unsafeUnwrap();

    expect(finalChatRoom.messages).toHaveLength(2);
    expect(finalChatRoom.messages[0]).toBe(message1);
    expect(finalChatRoom.messages[1]).toBe(message2);
  });

  test('should return error when operator is not a member of chat room', () => {
    const name = chatRoomNameFromString('No Operator Room')._unsafeUnwrap();
    const memberUserId = generateUserId();
    const operatorUserId = generateUserId(); // Different user, not a member
    const member = createChatRoomMember({ userId: memberUserId });
    const chatRoom = createChatRoom({
      name,
      operatorUserId: memberUserId, // Create with memberUserId as operator
      initialMembers: new Set([member]),
    })._unsafeUnwrap();

    const messageContent = chatRoomMessageContentFromString('Test message');
    const message = createChatRoomMessage({
      author: member,
      content: messageContent,
    });

    const result = postMessage(chatRoom, message, operatorUserId);

    expect(result.isErr()).toBe(true);
    const error = result._unsafeUnwrapErr();
    expect(error).toBeInstanceOf(ChatRoomOperatorNotMemberError);
    expect(error.message).toBe(
      'Operator must be a member of the ChatRoom to post messages',
    );
  });

  test('should return error when message author is not the operator', () => {
    const name = chatRoomNameFromString('Author Mismatch Room')._unsafeUnwrap();
    const operatorUserId = generateUserId();
    const authorUserId = generateUserId();
    const operatorMember = createChatRoomMember({ userId: operatorUserId });
    const authorMember = createChatRoomMember({ userId: authorUserId });
    const chatRoom = createChatRoom({
      name,
      operatorUserId,
      initialMembers: new Set([operatorMember, authorMember]),
    })._unsafeUnwrap();

    const messageContent = chatRoomMessageContentFromString('Test message');
    const message = createChatRoomMessage({
      author: authorMember, // Author is different from operator
      content: messageContent,
    });

    const result = postMessage(chatRoom, message, operatorUserId);

    expect(result.isErr()).toBe(true);
    const error = result._unsafeUnwrapErr();
    expect(error).toBeInstanceOf(ChatRoomMessageAuthorMismatchError);
    expect(error.message).toBe('Message author must match the operator');
  });

  test('should allow member to post message when they are both member and author', () => {
    const name = chatRoomNameFromString('Valid Member Room')._unsafeUnwrap();
    const memberUserId = generateUserId();
    const otherUserId = generateUserId();
    const member = createChatRoomMember({ userId: memberUserId });
    const otherMember = createChatRoomMember({ userId: otherUserId });
    const chatRoom = createChatRoom({
      name,
      operatorUserId: otherUserId, // Created by other user
      initialMembers: new Set([member, otherMember]),
    })._unsafeUnwrap();

    const messageContent = chatRoomMessageContentFromString('My message');
    const message = createChatRoomMessage({
      author: member,
      content: messageContent,
    });

    // memberUserId posts their own message
    const result = postMessage(chatRoom, message, memberUserId);

    expect(result.isOk()).toBe(true);
    const updatedChatRoom = result._unsafeUnwrap();
    expect(updatedChatRoom.messages).toHaveLength(1);
    expect(updatedChatRoom.messages[0]?.author).toBe(member);
    expect(updatedChatRoom.messages[0]?.content).toBe(messageContent);
  });

  test('should preserve chat room properties when posting message', () => {
    const name = chatRoomNameFromString('Preserve Properties Room')._unsafeUnwrap();
    const userId1 = generateUserId();
    const userId2 = generateUserId();
    const member1 = createChatRoomMember({ userId: userId1 });
    const member2 = createChatRoomMember({ userId: userId2 });
    const chatRoom = createChatRoom({
      name,
      operatorUserId: userId1,
      initialMembers: new Set([member1, member2]),
    })._unsafeUnwrap();

    const messageContent = chatRoomMessageContentFromString('Test message');
    const message = createChatRoomMessage({
      author: member1,
      content: messageContent,
    });

    const result = postMessage(chatRoom, message, userId1);

    expect(result.isOk()).toBe(true);
    const updatedChatRoom = result._unsafeUnwrap();
    expect(updatedChatRoom.id).toBe(chatRoom.id);
    expect(updatedChatRoom.name).toBe(chatRoom.name);
    expect(updatedChatRoom.members).toBe(chatRoom.members);
    expect(updatedChatRoom.members.size).toBe(2);
    expect(updatedChatRoom.members.has(member1)).toBe(true);
    expect(updatedChatRoom.members.has(member2)).toBe(true);
  });

  test('should handle empty initial messages array', () => {
    const name = chatRoomNameFromString('Empty Messages Room')._unsafeUnwrap();
    const userId = generateUserId();
    const member = createChatRoomMember({ userId });
    const chatRoom = createChatRoom({
      name,
      operatorUserId: userId,
      initialMembers: new Set([member]),
    })._unsafeUnwrap();

    // Verify initial state
    expect(chatRoom.messages).toHaveLength(0);

    const messageContent = chatRoomMessageContentFromString('First message');
    const message = createChatRoomMessage({
      author: member,
      content: messageContent,
    });

    const result = postMessage(chatRoom, message, userId);

    expect(result.isOk()).toBe(true);
    const updatedChatRoom = result._unsafeUnwrap();
    expect(updatedChatRoom.messages).toHaveLength(1);
    expect(updatedChatRoom.messages[0]).toBe(message);
  });
});