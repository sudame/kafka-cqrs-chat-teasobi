import { describe, expect, test } from 'vitest';
import { generateUserId } from '../user/userId';
import { createChatRoomMember } from './chatRoomMember';
import { createChatRoomMessage } from './chatRoomMessage';
import { chatRoomMessageContentFromString } from './chatRoomMessageContent';

describe('ChatRoomMessage', () => {
  test('createChatRoomMessage creates message with generated id', () => {
    const userId = generateUserId();
    const author = createChatRoomMember({ userId });
    const content = chatRoomMessageContentFromString('Hello, world!');
    
    const message = createChatRoomMessage({ author, content });
    
    expect(message.id).toBeDefined();
    expect(message.id).toMatch(/^message-/);
    expect(message.author).toBe(author);
    expect(message.content).toBe(content);
  });

  test('createChatRoomMessage generates different ids', () => {
    const userId = generateUserId();
    const author = createChatRoomMember({ userId });
    const content = chatRoomMessageContentFromString('Test message');
    
    const message1 = createChatRoomMessage({ author, content });
    const message2 = createChatRoomMessage({ author, content });
    
    expect(message1.id).not.toBe(message2.id);
    expect(message1.author).toBe(author);
    expect(message2.author).toBe(author);
    expect(message1.content).toBe(content);
    expect(message2.content).toBe(content);
  });

  test('createChatRoomMessage with different authors and content', () => {
    const userId1 = generateUserId();
    const userId2 = generateUserId();
    const author1 = createChatRoomMember({ userId: userId1 });
    const author2 = createChatRoomMember({ userId: userId2 });
    const content1 = chatRoomMessageContentFromString('First message');
    const content2 = chatRoomMessageContentFromString('Second message');
    
    const message1 = createChatRoomMessage({ author: author1, content: content1 });
    const message2 = createChatRoomMessage({ author: author2, content: content2 });
    
    expect(message1.id).not.toBe(message2.id);
    expect(message1.author).toBe(author1);
    expect(message2.author).toBe(author2);
    expect(message1.content).toBe(content1);
    expect(message2.content).toBe(content2);
  });
});