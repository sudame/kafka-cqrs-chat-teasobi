import z from 'zod/v4';

export const createChatRoomCommandSchema = z.object({
  chatRoomName: z.string(),
  chatRoomMemberIds: z.array(z.string()),
  operatorUserId: z.string(),
});

export type CreateChatRoomCommand = z.infer<typeof createChatRoomCommandSchema>;
