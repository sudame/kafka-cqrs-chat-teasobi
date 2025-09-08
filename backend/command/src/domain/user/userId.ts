import { err, ok, type Result } from 'neverthrow';
import { isValid as isValidUlid, ulid } from 'ulid';

export type UserId = string & { userId: never };

export class UserIdValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserIdValidationError';
  }
}

export function generateUserId(): UserId {
  return `user-${ulid()}` as UserId;
}

export function userIdFromString(
  id: string,
): Result<UserId, UserIdValidationError> {
  if (!id.startsWith('user-')) {
    return err(
      new UserIdValidationError(
        `UserId must start with "user-", but got: "${id}"`,
      ),
    );
  }

  const ulidPart = id.slice('user-'.length);
  if (!isValidUlid(ulidPart)) {
    return err(
      new UserIdValidationError(`UserId must ends with ULID, but got: "${id}"`),
    );
  }

  return ok(id as UserId);
}

export function userIdToString(userId: UserId): string {
  return userId as string;
}
