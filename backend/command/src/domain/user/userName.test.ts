import { describe, expect, test } from 'vitest';
import { userNameAsString, userNameFromString } from './userName';

describe('UserName', () => {
  test('fromString with valid name', () => {
    const validName = 'John Doe';
    const result = userNameFromString(validName);
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toBe(validName);
  });

  test('fromString with empty name', () => {
    const emptyName = '';
    const result = userNameFromString(emptyName);
    expect(result.isErr()).toBe(true);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error);
    expect(result._unsafeUnwrapErr().message).toBe(
      'UserName cannot be empty',
    );
  });

  test('fromString with name at max length', () => {
    const maxLengthName = 'a'.repeat(256);
    const result = userNameFromString(maxLengthName);
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toBe(maxLengthName);
  });

  test('fromString with name exceeding max length', () => {
    const tooLongName = 'a'.repeat(257);
    const result = userNameFromString(tooLongName);
    expect(result.isErr()).toBe(true);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error);
    expect(result._unsafeUnwrapErr().message).toBe(
      'UserName must be 256 characters or less, but got 257 characters',
    );
  });

  test('fromString with Japanese characters', () => {
    const japaneseName = 'ユーザー名';
    const result = userNameFromString(japaneseName);
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toBe(japaneseName);
  });

  test('fromString with special characters', () => {
    const specialName = '👤 User #1 - Developer';
    const result = userNameFromString(specialName);
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toBe(specialName);
  });

  test('asString returns the original string', () => {
    const validName = userNameFromString('Test User');
    expect(userNameAsString(validName._unsafeUnwrap())).toBe('Test User');
  });
});