import { err, ok, Result } from 'neverthrow';
import { createUser, User } from '../models/user';
import { generateUserId } from '../models/userId';
import { CreateUserArgs as CreateDomainUserArgs } from '../models/user';
import { UserCreatedEvent } from '../events/userCreated';

export type CreateUserArgs = {
  userName: string;
};

export type CreateUserOkResult = {
  user: User;
  event: UserCreatedEvent;
};

export type CreateUser = (
  args: CreateUserArgs,
) => Result<CreateUserOkResult, Error>;

export function createCreateUser(): CreateUser {
  return (args: CreateUserArgs) => {
    const generateUserIdResult = generateUserId();
    if (generateUserIdResult.isErr()) {
      const error = generateUserIdResult.error;
      return err(error);
    }
    const userId = generateUserIdResult.value;

    const createDomainUserArgs: CreateDomainUserArgs = {
      id: userId,
      version: 1,
      createdAt: new Date(),
      name: args.userName,
    };

    const createUserResult = createUser(createDomainUserArgs);
    if (createUserResult.isErr()) {
      const error = createUserResult.error;
      return err(error);
    }
    const user = createUserResult.value;

    const event: UserCreatedEvent = {
      type: 'user-created',
      user: {
        name: user.name,
        createdAt: user.createdAt.getTime(),
        id: user.id.value,
        version: user.version,
      },
      createdAt: Date.now(),
      toVersion: 1,
    };

    return ok({
      user: createUserResult.value,
      event,
    });
  };
}
