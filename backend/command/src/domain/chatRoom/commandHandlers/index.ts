import { Kafka } from 'kafkajs';
import { DomainObjectId } from '../../../core/domainObjectId';
import { rebuildDomainObject } from '../../../tools/rebuildDomainObject';
import { ChatRoomEvent, applyChatRoomEventToChatRoom } from '../events';
import { ChatRoom, emptyChatRoom } from '../models/chatRoom';

export const rebuildChatRoom = (chatRoomId: DomainObjectId, kafka: Kafka) =>
  rebuildDomainObject<ChatRoom, ChatRoomEvent>({
    kafka,
    domainObjectId: chatRoomId,
    initialDomainObject: null,
    applyFunction: applyChatRoomEventToChatRoom,
  });
