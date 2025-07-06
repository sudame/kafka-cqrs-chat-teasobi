import { err, ok, Result } from 'neverthrow';
import { ulid } from 'ulid';

export type UserId = {
  value: string;
};

export function newUserId(value: string): Result<UserId, Error> {
  if (value === '') {
    return err(new Error('User ID cannot be an empty string.'));
  }

  const userId: UserId = { value };
  return ok(userId);
}

export function newUserIdFromSafeValue(safeValue: string): UserId {
  return {
    value: safeValue,
  };
}

export function generateUserId(
  uniqueIdGenerator?: () => string,
): Result<UserId, Error> {
  const uniquePart = uniqueIdGenerator ? uniqueIdGenerator() : ulid();
  const id = `user-${uniquePart}`;
  return newUserId(id);
}
