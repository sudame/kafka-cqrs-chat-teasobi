import { err, ok, Result } from 'neverthrow';
import { User } from '../models/user';
import { newUserIdFromSafeValue } from '../models/userId';

export type UserCreatedEvent = {
  type: 'user-created';
  user: {
    name: string;
    createdAt: number;
    id: string;
    version: number;
  };
  createdAt: number;
  toVersion: number;
};

export function userCreatedEventToKafkaMessage(event: UserCreatedEvent): {
  key: string;
  value: string;
} {
  return {
    key: event.user.id,
    value: JSON.stringify(event),
  };
}

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
