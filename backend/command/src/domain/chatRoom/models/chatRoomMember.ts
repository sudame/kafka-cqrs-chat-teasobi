import { User } from '../../user/models/user';
import { ChatRoomMemberId } from './chatRoomMemberId';

export interface ChatRoomMember {
  id: ChatRoomMemberId;
  user: User;
}
