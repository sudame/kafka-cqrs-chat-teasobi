// cSpell:words 01F8MECHZX3TBDSZ7XRADM79XE

import { describe, expect, test } from 'vitest';
import { userIdFromString, userIdToString } from './userId';

describe('UserId', () => {
  test('fromString with valid id', () => {
    const validId = 'user-01F8MECHZX3TBDSZ7XRADM79XE';
    const result = userIdFromString(validId);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toBe(validId);
    }
  });

  test('fromString with invalid prefix', () => {
    const invalidId = 'invalid-01F8MECHZX3TBDSZ7XRADM79XE';
    const result = userIdFromString(invalidId);
    expect(result.isErr()).toBe(true);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error);
    expect(result._unsafeUnwrapErr().message).toBe(
      `UserId must start with "user-", but got: "invalid-01F8MECHZX3TBDSZ7XRADM79XE"`,
    );
  });

  test('fromString with invalid ULID part', () => {
    const invalidId = 'user-INVALID_ULID_PART';
    const result = userIdFromString(invalidId);
    expect(result.isErr()).toBe(true);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error);
    expect(result._unsafeUnwrapErr().message).toBe(
      `UserId must ends with ULID, but got: "user-INVALID_ULID_PART"`,
    );
  });

  test('asString returns the original string', () => {
    const validId = userIdFromString('user-01F8MECHZX3TBDSZ7XRADM79XE');
    expect(userIdToString(validId._unsafeUnwrap())).toBe(
      'user-01F8MECHZX3TBDSZ7XRADM79XE',
    );
  });
});
