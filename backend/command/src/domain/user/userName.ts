import { err, ok, type Result } from 'neverthrow';

export type UserName = string & { userName: never };

const MAX_LENGTH = 256;

export class UserNameValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserNameValidationError';
  }
}

export function userNameFromString(
  name: string,
): Result<UserName, UserNameValidationError> {
  if (name.length === 0) {
    return err(new UserNameValidationError('UserName cannot be empty'));
  }

  if (name.length > MAX_LENGTH) {
    return err(
      new UserNameValidationError(
        `UserName must be ${MAX_LENGTH} characters or less, but got ${name.length} characters`,
      ),
    );
  }

  return ok(name as UserName);
}

export function userNameAsString(userName: UserName): string {
  return userName as string;
}
