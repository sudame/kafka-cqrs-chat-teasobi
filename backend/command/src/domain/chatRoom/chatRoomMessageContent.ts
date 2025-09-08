export type ChatRoomMessageContent = string & { chatRoomMessageContent: never };

export function chatRoomMessageContentFromString(
  content: string,
): ChatRoomMessageContent {
  return content as ChatRoomMessageContent;
}

export function chatRoomMessageContentAsString(chatRoomMessageContent: ChatRoomMessageContent): string {
  return chatRoomMessageContent as string;
}