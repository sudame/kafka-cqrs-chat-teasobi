import z from 'zod/v4';

export const createUserCommandSchema = z.object({
  userName: z.string(),
});

export type CreateUserCommand = z.infer<typeof createUserCommandSchema>;
