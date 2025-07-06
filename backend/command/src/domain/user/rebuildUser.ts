import { Kafka } from 'kafkajs';
import { rebuildDomainObject } from '../../tools/rebuildDomainObject';
import { UserEvent, applyUserEventToUser } from './eventAppliers';
import { UserId } from './models/userId';
import { User } from './models/user';

export const rebuildUser = (userId: UserId, kafka: Kafka) =>
  rebuildDomainObject<User, UserEvent>({
    kafka,
    domainObjectId: userId.value,
    initialDomainObject: null,
    applyFunction: applyUserEventToUser,
  });
