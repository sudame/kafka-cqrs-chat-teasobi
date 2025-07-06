import { UserCreatedEvent } from '@share/events/userCreated';
import { Result, err, ok } from 'neverthrow';
import { User } from '../models/user';
import { newUserIdFromSafeValue } from '../models/userId';

export function applyUserCreatedEventToUser(
  existingUser: User | null,
  event: UserCreatedEvent,
): Result<User, Error> {
  if (existingUser != null) {
    return err(new Error('User already exists.'));
  }

  const newUser: User = {
    id: newUserIdFromSafeValue(event.user.id),
    version: event.user.version,
    createdAt: new Date(event.user.createdAt),
    name: event.user.name,
  };

  return ok(newUser);
}
