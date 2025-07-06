import { Kafka } from 'kafkajs';
import { rebuildDomainObject } from '../../tools/rebuildDomainObject';
import { ChatRoomEvent, applyChatRoomEventToChatRoom } from './eventAppliers';
import { ChatRoom } from './models/chatRoom';
import { ChatRoomId } from './models/chatRoomId';

export const rebuildChatRoom = (chatRoomId: ChatRoomId, kafka: Kafka) =>
  rebuildDomainObject<ChatRoom, ChatRoomEvent>({
    kafka,
    domainObjectId: chatRoomId.value,
    initialDomainObject: null,
    applyFunction: applyChatRoomEventToChatRoom,
  });
