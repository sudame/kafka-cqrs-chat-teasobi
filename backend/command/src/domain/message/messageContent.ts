export type MessageContent = string & { chatRoomMessageContent: never };

export function messageContentFromString(content: string): MessageContent {
  return content as MessageContent;
}

export function messageContentAsString(
  chatRoomMessageContent: MessageContent,
): string {
  return chatRoomMessageContent as string;
}
