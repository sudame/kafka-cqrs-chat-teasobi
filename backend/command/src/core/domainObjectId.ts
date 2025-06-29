import { ulid } from 'ulid';

export type DomainObjectId = string;

export function newDomainObjectId(
  domainObjectType: string,
  uniqueIdGenerator?: () => string,
): DomainObjectId {
  const uniqueId = uniqueIdGenerator?.() ?? ulid();
  return `${domainObjectType}-${uniqueId}`;
}
