import { Kafka } from 'kafkajs';
import { DomainObjectId } from '../../../core/domainObjectId';
import { createEmptyUser, User } from '../models/user';
import { applyUserEventToUser, UserEvent } from '../events';
import { rebuildDomainObject } from '../../../tools/rebuildDomainObject';

export const rebuildUser = (userId: DomainObjectId, kafka: Kafka) =>
  rebuildDomainObject<User, UserEvent>({
    kafka,
    domainObjectId: userId,
    initialDomainObject: createEmptyUser(userId),
    applyFunction: applyUserEventToUser,
  });
