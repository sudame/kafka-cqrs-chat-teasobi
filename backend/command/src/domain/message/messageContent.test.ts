import { describe, expect, test } from 'vitest';
import {
  messageContentAsString,
  messageContentFromString,
} from './messageContent';

describe('ChatRoomMessageContent', () => {
  test('fromString creates ChatRoomMessageContent from string', () => {
    const content = 'Hello, world!';
    const messageContent = messageContentFromString(content);

    expect(messageContent).toBeDefined();
    expect(typeof messageContent).toBe('string');
  });

  test('asString returns the original string', () => {
    const content = 'Hello, world!';
    const messageContent = messageContentFromString(content);
    const result = messageContentAsString(messageContent);

    expect(result).toBe(content);
  });

  test('handles empty string', () => {
    const content = '';
    const messageContent = messageContentFromString(content);
    const result = messageContentAsString(messageContent);

    expect(result).toBe('');
  });

  test('handles long content', () => {
    const content = 'a'.repeat(1000);
    const messageContent = messageContentFromString(content);
    const result = messageContentAsString(messageContent);

    expect(result).toBe(content);
    expect(result.length).toBe(1000);
  });

  test('handles special characters and emojis', () => {
    const content = 'こんにちは！ 🌟 Hello! @user #hashtag';
    const messageContent = messageContentFromString(content);
    const result = messageContentAsString(messageContent);

    expect(result).toBe(content);
  });

  test('handles multiline content', () => {
    const content = `Line 1
Line 2
Line 3`;
    const messageContent = messageContentFromString(content);
    const result = messageContentAsString(messageContent);

    expect(result).toBe(content);
  });
});
