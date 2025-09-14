import { generateUserId, type UserId } from './userId';
import type { UserName } from './userName';

export type User = {
  id: UserId;
  name: UserName;
};

export type CreateUserParam = {
  name: UserName;
};

export function createUser(param: CreateUserParam): User {
  const id = generateUserId();

  return {
    id: id,
    name: param.name,
  };
}
