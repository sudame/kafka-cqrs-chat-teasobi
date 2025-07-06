import { err, ok, Result } from 'neverthrow';
import { User } from '../models/user';
import { UserCreatedEvent } from '@share/events/userCreated';
import { applyUserCreatedEventToUser } from './userCreated';

export type UserEvent = UserCreatedEvent;

export type UserApplyFunction = (
  user: User | null,
  event: UserEvent,
) => Result<User, Error>;

const eventTypeToApplyFunctionMap: Record<
  UserEvent['type'],
  UserApplyFunction
> = {
  'user-created': applyUserCreatedEventToUser,
};

export async function applyUserEventToUser(
  user: User | null,
  event: UserEvent,
): Promise<Result<User, Error>> {
  let newUser: User;

  const applyFunction = eventTypeToApplyFunctionMap[event.type];
  const result = applyFunction(user, event);
  if (result.isErr()) {
    return err(result.error);
  }
  newUser = result.value;

  return ok(newUser);
}
