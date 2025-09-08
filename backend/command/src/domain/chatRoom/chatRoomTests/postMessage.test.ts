import { describe, expect, test } from 'vitest';
import { generateUserId } from '../../user/userId';
import {
  ChatRoomMessageAuthorMismatchError,
  ChatRoomOperatorNotMemberError,
  postMessage,
} from '../chatRoom';
import { aChatRoom, aChatRoomMember, aChatRoomMessage } from './testHelpers';

describe('postMessage', () => {
  test('should add message to chat room when operator is author and member', () => {
    const userId = generateUserId();
    const member = aChatRoomMember().withUserId(userId).build();
    const chatRoom = aChatRoom()
      .withOperatorUserId(userId)
      .withMembers(member)
      .buildUnsafe();

    const message = aChatRoomMessage()
      .withAuthor(member)
      .withContent('Hello, world!')
      .build();

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
    const userId = generateUserId();
    const member = aChatRoomMember().withUserId(userId).build();
    const originalChatRoom = aChatRoom()
      .withName('Original Room')
      .withOperatorUserId(userId)
      .withMembers(member)
      .buildUnsafe();

    const message = aChatRoomMessage()
      .withAuthor(member)
      .withContent('Test message')
      .build();

    const result = postMessage(originalChatRoom, message, userId);

    expect(result.isOk()).toBe(true);
    const updatedChatRoom = result._unsafeUnwrap();
    expect(originalChatRoom.messages).toHaveLength(0);
    expect(updatedChatRoom.messages).toHaveLength(1);
    expect(originalChatRoom.messages).not.toBe(updatedChatRoom.messages);
  });

  test('should add multiple messages sequentially', () => {
    const userId = generateUserId();
    const member = aChatRoomMember().withUserId(userId).build();
    let chatRoom = aChatRoom()
      .withName('Multiple Messages Room')
      .withOperatorUserId(userId)
      .withMembers(member)
      .buildUnsafe();

    const message1 = aChatRoomMessage()
      .withAuthor(member)
      .withContent('First message')
      .build();

    const result1 = postMessage(chatRoom, message1, userId);
    expect(result1.isOk()).toBe(true);
    chatRoom = result1._unsafeUnwrap();

    const message2 = aChatRoomMessage()
      .withAuthor(member)
      .withContent('Second message')
      .build();

    const result2 = postMessage(chatRoom, message2, userId);
    expect(result2.isOk()).toBe(true);
    const finalChatRoom = result2._unsafeUnwrap();

    expect(finalChatRoom.messages).toHaveLength(2);
    expect(finalChatRoom.messages[0]).toBe(message1);
    expect(finalChatRoom.messages[1]).toBe(message2);
  });

  test('should return error when operator is not a member of chat room', () => {
    const memberUserId = generateUserId();
    const operatorUserId = generateUserId(); // Different user, not a member
    const member = aChatRoomMember().withUserId(memberUserId).build();
    const chatRoom = aChatRoom()
      .withName('No Operator Room')
      .withOperatorUserId(memberUserId) // Create with memberUserId as operator
      .withMembers(member)
      .buildUnsafe();

    const message = aChatRoomMessage()
      .withAuthor(member)
      .withContent('Test message')
      .build();

    const result = postMessage(chatRoom, message, operatorUserId);

    expect(result.isErr()).toBe(true);
    const error = result._unsafeUnwrapErr();
    expect(error).toBeInstanceOf(ChatRoomOperatorNotMemberError);
    expect(error.message).toBe(
      'Operator must be a member of the ChatRoom to post messages',
    );
  });

  test('should return error when message author is not the operator', () => {
    const operatorUserId = generateUserId();
    const authorUserId = generateUserId();
    const operatorMember = aChatRoomMember().withUserId(operatorUserId).build();
    const authorMember = aChatRoomMember().withUserId(authorUserId).build();
    const chatRoom = aChatRoom()
      .withName('Author Mismatch Room')
      .withOperatorUserId(operatorUserId)
      .withMembers(operatorMember, authorMember)
      .buildUnsafe();

    const message = aChatRoomMessage()
      .withAuthor(authorMember) // Author is different from operator
      .withContent('Test message')
      .build();

    const result = postMessage(chatRoom, message, operatorUserId);

    expect(result.isErr()).toBe(true);
    const error = result._unsafeUnwrapErr();
    expect(error).toBeInstanceOf(ChatRoomMessageAuthorMismatchError);
    expect(error.message).toBe('Message author must match the operator');
  });

  test('should allow member to post message when they are both member and author', () => {
    const memberUserId = generateUserId();
    const otherUserId = generateUserId();
    const member = aChatRoomMember().withUserId(memberUserId).build();
    const otherMember = aChatRoomMember().withUserId(otherUserId).build();
    const chatRoom = aChatRoom()
      .withName('Valid Member Room')
      .withOperatorUserId(otherUserId) // Created by other user
      .withMembers(member, otherMember)
      .buildUnsafe();

    const message = aChatRoomMessage()
      .withAuthor(member)
      .withContent('My message')
      .build();

    // memberUserId posts their own message
    const result = postMessage(chatRoom, message, memberUserId);

    expect(result.isOk()).toBe(true);
    const updatedChatRoom = result._unsafeUnwrap();
    expect(updatedChatRoom.messages).toHaveLength(1);
    expect(updatedChatRoom.messages[0]?.author).toBe(member);
    expect(updatedChatRoom.messages[0]?.content.valueOf()).toBe('My message');
  });

  test('should preserve chat room properties when posting message', () => {
    const userId1 = generateUserId();
    const userId2 = generateUserId();
    const member1 = aChatRoomMember().withUserId(userId1).build();
    const member2 = aChatRoomMember().withUserId(userId2).build();
    const chatRoom = aChatRoom()
      .withName('Preserve Properties Room')
      .withOperatorUserId(userId1)
      .withMembers(member1, member2)
      .buildUnsafe();

    const message = aChatRoomMessage()
      .withAuthor(member1)
      .withContent('Test message')
      .build();

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
    const userId = generateUserId();
    const member = aChatRoomMember().withUserId(userId).build();
    const chatRoom = aChatRoom()
      .withName('Empty Messages Room')
      .withOperatorUserId(userId)
      .withMembers(member)
      .buildUnsafe();

    // Verify initial state
    expect(chatRoom.messages).toHaveLength(0);

    const message = aChatRoomMessage()
      .withAuthor(member)
      .withContent('First message')
      .build();

    const result = postMessage(chatRoom, message, userId);

    expect(result.isOk()).toBe(true);
    const updatedChatRoom = result._unsafeUnwrap();
    expect(updatedChatRoom.messages).toHaveLength(1);
    expect(updatedChatRoom.messages[0]).toBe(message);
  });
});