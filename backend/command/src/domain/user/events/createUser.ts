import { DomainObjectId } from '../../../core/domainObjectId';
import { createEmptyUser, newUserId, User } from '../models/user';

export interface CreateUserEvent {
  type: 'CreateUser';
  userId: DomainObjectId;
  userName: string;
  createdAt: number;
  newUserVersion: 1;
}

export function applyCreateUserEventToUser(
  user: User | null,
  event: CreateUserEvent,
): User {
  if (user != null) {
    throw new Error('User already exists.');
  }

  const newUser: User = Object.assign({}, createEmptyUser(newUserId()), {
    version: event.newUserVersion,
    name: event.userName,
    createdAt: event.createdAt,
  });

  return newUser;
}
