import { describe, expect, test } from 'vitest';
import { generateChatRoomId } from '../chatRoom/chatRoomId';
import { createUser } from '../user/user';
import { userNameFromString } from '../user/userName';
import { createMessage } from './message';
import { messageContentFromString } from './messageContent';

describe('Message', () => {
  test('createMessage creates message with generated id', () => {
    const chatRoomId = generateChatRoomId();
    const author = createUser({
      name: userNameFromString('Test User')._unsafeUnwrap(),
    });
    const content = messageContentFromString('Hello, world!');

    const message = createMessage({ author, content, chatRoomId });

    expect(message.id).toBeDefined();
    expect(message.id).toMatch(/^message-/);
    expect(message.author).toBe(author);
    expect(message.content).toBe(content);
  });

  test('createMessage generates different ids', () => {
    const chatRoomId = generateChatRoomId();
    const author = createUser({
      name: userNameFromString('Test User')._unsafeUnwrap(),
    });
    const content = messageContentFromString('Test message');

    const message1 = createMessage({ chatRoomId, author, content });
    const message2 = createMessage({ chatRoomId, author, content });

    expect(message1.id).not.toBe(message2.id);
    expect(message1.author).toBe(author);
    expect(message2.author).toBe(author);
    expect(message1.content).toBe(content);
    expect(message2.content).toBe(content);
  });

  test('createMessage with different authors and content', () => {
    const chatRoomId = generateChatRoomId();
    const author1 = createUser({
      name: userNameFromString('Author 1')._unsafeUnwrap(),
    });
    const author2 = createUser({
      name: userNameFromString('Author 2')._unsafeUnwrap(),
    });
    const content1 = messageContentFromString('First message');
    const content2 = messageContentFromString('Second message');

    const message1 = createMessage({
      chatRoomId,
      author: author1,
      content: content1,
    });
    const message2 = createMessage({
      chatRoomId,
      author: author2,
      content: content2,
    });

    expect(message1.id).not.toBe(message2.id);
    expect(message1.author).toBe(author1);
    expect(message2.author).toBe(author2);
    expect(message1.content).toBe(content1);
    expect(message2.content).toBe(content2);
  });
});
