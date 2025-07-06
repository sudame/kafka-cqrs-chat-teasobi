import { ChatMessagePostedToChatRoomEvent } from './chatMessagePostedToChatRoom';
import { ChatRoomCreatedEvent } from './chatRoomCreated';
import { UserCreatedEvent } from './userCreated';

export type ChatEvent =
  | ChatRoomCreatedEvent
  | UserCreatedEvent
  | ChatMessagePostedToChatRoomEvent;
