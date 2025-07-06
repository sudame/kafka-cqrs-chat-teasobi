import { err, ok, Result } from 'neverthrow';
import { ChatRoom } from '../models/chatRoom';
import { ChatMessage } from '../models/chatMessage';
import { newChatMessageIdFromSafeValue } from '../models/ChatMessageId';

export interface ChatMessagePostedToChatRoomEvent {
  type: 'chat-message-posted-to-chat-room';
  chatRoomId: string;
  chatMessage: {
    id: string;
    postedAt: number;
    authorUserId: string;
    content: string;
  };
  createdAt: number;
  toVersion: number;
}

export async function applyChatMessagePostedEventToChatRoom(
  chatRoom: ChatRoom | null,
  event: ChatMessagePostedToChatRoomEvent,
): Promise<Result<ChatRoom, Error>> {
  if (chatRoom == null) {
    return err(new Error('Chat room does not exist.'));
  }

  // チャットルームのIDが一致しない場合はエラー
  if (chatRoom.id.value !== event.chatRoomId) {
    return err(new Error('Chat room ID mismatch.'));
  }

  const authorUser = chatRoom.members.find(
    (member) => member.user.id.value === event.chatMessage.authorUserId,
  )?.user;
  if (!authorUser) {
    return err(new Error('Author user is not a member of the chat room.'));
  }

  // メッセージをチャットルームに追加
  const newMessage: ChatMessage = {
    id: newChatMessageIdFromSafeValue(event.chatMessage.id),
    postedAt: new Date(event.chatMessage.postedAt),
    authorUser,
    content: event.chatMessage.content,
  };

  const newChatRoom: ChatRoom = {
    ...chatRoom,
    version: event.toVersion,
    messages: [...chatRoom.messages, newMessage],
  };

  return ok(newChatRoom);
}

export function chatMessagePostedToChatRoomEventToKafkaMessage(
  event: ChatMessagePostedToChatRoomEvent,
): { key: string; value: string } {
  return {
    key: event.chatRoomId,
    value: JSON.stringify(event),
  };
}
