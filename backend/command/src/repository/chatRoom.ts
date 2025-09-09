import { err, ok, type Result } from 'neverthrow';
import type { ChatRoom } from '../domain/chatRoom/chatRoom';
import { db } from './database';

class CreateChatRoomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CreateChatRoomError';
  }
}

export async function create(
  chatRoom: ChatRoom,
): Promise<Result<void, CreateChatRoomError>> {
  try {
    await db.transaction().execute(async (trx) => {
      await trx
        .insertInto('chatRoom')
        .values([
          {
            id: chatRoom.id,
            name: chatRoom.name,
          },
        ])
        .execute();

      if (chatRoom.members.size > 0) {
        const memberValues = Array.from(chatRoom.members).map((member) => ({
          id: member.memberId,
          chatRoomId: chatRoom.id,
          userId: member.userId,
        }));
        await trx.insertInto('member').values(memberValues).execute();
      }

      if (chatRoom.messages.length > 0) {
        const messageValues = chatRoom.messages.map((message) => ({
          id: message.id,
          chatRoomId: chatRoom.id,
          authorMemberId: message.author.memberId,
          content: message.content,
          createdAt: new Date(),
        }));
        await trx.insertInto('message').values(messageValues).execute();
      }
    });
    return ok();
  } catch (error) {
    return err(
      new CreateChatRoomError(`Failed to create chat room: ${String(error)}`),
    );
  }
}
