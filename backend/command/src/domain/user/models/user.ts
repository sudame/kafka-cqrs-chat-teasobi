import { err, ok, Result } from 'neverthrow';
import { AggregateDomainObject } from '../../../core/aggregateDomainObject';
import { UserId } from './userId';

export type User = {
  createdAt: Date;
  name: string;
} & AggregateDomainObject<UserId>;

export type CreateUserArgs = User;

export function createUser(args: CreateUserArgs): Result<User, Error> {
  // ユーザー名は空であってはならない
  if (args.name === '') {
    return err(new Error('User name cannot be empty.'));
  }

  const user: User = { ...args };
  return ok(user);
}
