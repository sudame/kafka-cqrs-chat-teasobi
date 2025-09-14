// cSpell:words 01F8MECHZX3TBDSZ7XRADM79XE

import { describe, expect, test } from 'vitest';
import { messageIdFromString, messageIdToString } from './messageId';

describe('ChatRoomMessageId', () => {
  test('fromString with valid id', () => {
    const validId = 'message-01F8MECHZX3TBDSZ7XRADM79XE';
    const result = messageIdFromString(validId);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toBe(validId);
    }
  });

  test('fromString with invalid prefix', () => {
    const invalidId = 'invalid-01F8MECHZX3TBDSZ7XRADM79XE';
    const result = messageIdFromString(invalidId);
    expect(result.isErr()).toBe(true);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error);
    expect(result._unsafeUnwrapErr().message).toBe(
      `ChatRoomMessageId must start with "message-", but got: "invalid-01F8MECHZX3TBDSZ7XRADM79XE"`,
    );
  });

  test('fromString with invalid ULID part', () => {
    const invalidId = 'message-INVALID_ULID_PART';
    const result = messageIdFromString(invalidId);
    expect(result.isErr()).toBe(true);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error);
    expect(result._unsafeUnwrapErr().message).toBe(
      `ChatRoomMessageId must ends with ULID, but got: "message-INVALID_ULID_PART"`,
    );
  });

  test('toString returns the original string', () => {
    const validId = messageIdFromString('message-01F8MECHZX3TBDSZ7XRADM79XE');
    expect(messageIdToString(validId._unsafeUnwrap())).toBe(
      'message-01F8MECHZX3TBDSZ7XRADM79XE',
    );
  });
});
