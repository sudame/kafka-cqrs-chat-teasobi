import { describe, expect, test } from 'vitest';
import { chatRoomNameAsString, chatRoomNameFromString } from './chatRoomName';

describe('ChatRoomName', () => {
  test('fromString with valid name', () => {
    const validName = 'General Discussion';
    const result = chatRoomNameFromString(validName);
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toBe(validName);
  });

  test('fromString with empty name', () => {
    const emptyName = '';
    const result = chatRoomNameFromString(emptyName);
    expect(result.isErr()).toBe(true);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error);
    expect(result._unsafeUnwrapErr().message).toBe(
      'ChatRoomName cannot be empty',
    );
  });

  test('fromString with name at max length', () => {
    const maxLengthName = 'a'.repeat(256);
    const result = chatRoomNameFromString(maxLengthName);
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toBe(maxLengthName);
  });

  test('fromString with name exceeding max length', () => {
    const tooLongName = 'a'.repeat(257);
    const result = chatRoomNameFromString(tooLongName);
    expect(result.isErr()).toBe(true);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error);
    expect(result._unsafeUnwrapErr().message).toBe(
      'ChatRoomName must be 256 characters or less, but got 257 characters',
    );
  });

  test('fromString with Japanese characters', () => {
    const japaneseName = 'チャットルーム名';
    const result = chatRoomNameFromString(japaneseName);
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toBe(japaneseName);
  });

  test('fromString with special characters', () => {
    const specialName = '💬 Chat Room #1 - Development';
    const result = chatRoomNameFromString(specialName);
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toBe(specialName);
  });

  test('asString returns the original string', () => {
    const validName = chatRoomNameFromString('Test Room');
    expect(chatRoomNameAsString(validName._unsafeUnwrap())).toBe('Test Room');
  });
});
