import z from 'zod/v4';

export const postMessageCommandSchema = z.object({
  chatRoomId: z.string(),
  authorUserId: z.string(),
  content: z.string().min(1, 'Content must not be empty'),
});

export type PostMessageCommand = z.infer<typeof postMessageCommandSchema>;
