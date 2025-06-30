import { User } from '../models/user';
import { applyCreateUserEventToUser, CreateUserEvent } from './createUser';

export type UserEvent = CreateUserEvent;

export function applyUserEventToUser(
  user: User | null,
  event: UserEvent,
): User {
  let newUser: User;

  switch (event.type) {
    case 'CreateUser': {
      newUser = applyCreateUserEventToUser(user, event);
      break;
    }
    default: {
      throw new Error(`Unknown event type: ${event}`);
    }
  }

  return newUser;
}
