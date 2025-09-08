// cSpell:words 01F8MECHZX3TBDSZ7XRADM79XE

import { describe, expect, test } from 'vitest';
import { chatRoomIdFromString, chatRoomIdToString } from './chatRoomId';

describe('ChatRoomId', () => {
  test('fromString with valid id', () => {
    const validId = 'room-01F8MECHZX3TBDSZ7XRADM79XE';
    const result = chatRoomIdFromString(validId);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toBe(validId);
    }
  });

  test('fromString with invalid prefix', () => {
    const invalidId = 'invalid-01F8MECHZX3TBDSZ7XRADM79XE';
    const result = chatRoomIdFromString(invalidId);
    expect(result.isErr()).toBe(true);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error);
    expect(result._unsafeUnwrapErr().message).toBe(
      `ChatRoomId must start with "room-", but got: "invalid-01F8MECHZX3TBDSZ7XRADM79XE"`,
    );
  });

  test('fromString with invalid ULID part', () => {
    const invalidId = 'room-INVALID_ULID_PART';
    const result = chatRoomIdFromString(invalidId);
    expect(result.isErr()).toBe(true);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error);
    expect(result._unsafeUnwrapErr().message).toBe(
      `ChatRoomId must ends with ULID, but got: "room-INVALID_ULID_PART"`,
    );
  });

  test('asString returns the original string', () => {
    const validId = chatRoomIdFromString('room-01F8MECHZX3TBDSZ7XRADM79XE');
    expect(chatRoomIdToString(validId._unsafeUnwrap())).toBe(
      'room-01F8MECHZX3TBDSZ7XRADM79XE',
    );
  });
});
