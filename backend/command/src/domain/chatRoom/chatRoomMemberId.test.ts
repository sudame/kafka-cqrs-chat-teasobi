// cSpell:words 01F8MECHZX3TBDSZ7XRADM79XE

import { describe, expect, test } from 'vitest';
import { chatRoomMemberIdFromString, chatRoomMemberIdToString } from './chatRoomMemberId';

describe('ChatRoomMemberId', () => {
  test('fromString with valid id', () => {
    const validId = 'member-01F8MECHZX3TBDSZ7XRADM79XE';
    const result = chatRoomMemberIdFromString(validId);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toBe(validId);
    }
  });

  test('fromString with invalid prefix', () => {
    const invalidId = 'invalid-01F8MECHZX3TBDSZ7XRADM79XE';
    const result = chatRoomMemberIdFromString(invalidId);
    expect(result.isErr()).toBe(true);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error);
    expect(result._unsafeUnwrapErr().message).toBe(
      `ChatRoomMemberId must start with "member-", but got: "invalid-01F8MECHZX3TBDSZ7XRADM79XE"`,
    );
  });

  test('fromString with invalid ULID part', () => {
    const invalidId = 'member-INVALID_ULID_PART';
    const result = chatRoomMemberIdFromString(invalidId);
    expect(result.isErr()).toBe(true);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error);
    expect(result._unsafeUnwrapErr().message).toBe(
      `ChatRoomMemberId must ends with ULID, but got: "member-INVALID_ULID_PART"`,
    );
  });

  test('toString returns the original string', () => {
    const validId = chatRoomMemberIdFromString('member-01F8MECHZX3TBDSZ7XRADM79XE');
    expect(chatRoomMemberIdToString(validId._unsafeUnwrap())).toBe(
      'member-01F8MECHZX3TBDSZ7XRADM79XE',
    );
  });
});