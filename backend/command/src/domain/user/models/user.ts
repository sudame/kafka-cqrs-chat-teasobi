import { AggregateDomainObject } from '../../../core/aggregateDomainObject';
import { newDomainObjectId } from '../../../core/domainObjectId';

export interface User extends AggregateDomainObject {
  createdAt: number;
  name: string;
}

export function newUserId(uniqueIdGenerator?: () => string): string {
  return newDomainObjectId('user', uniqueIdGenerator);
}

export function createEmptyUser(id: string): User {
  return {
    id,
    version: 0,
    createdAt: 0,
    name: '',
    internal: {
      kafkaLatestOffset: null,
    },
  };
}
