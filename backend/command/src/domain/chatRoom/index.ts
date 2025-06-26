export interface ChatRoomMember {
  id: string;
  userId: string;
}

export interface ChatRoom {
  id: string;
  members: ChatRoomMember[];
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  postedAt: number;
  authorUserId: string;
  content: string;
}
