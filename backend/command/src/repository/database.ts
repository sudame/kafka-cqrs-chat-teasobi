import { Kysely, MysqlDialect } from 'kysely';
import { createPool } from 'mysql2/promise';

interface ChatRoomTable {
  id: string;
  name: string;
}

interface MemberTable {
  id: string;
  chatRoomId: string;
  userId: string;
}

interface MessageTable {
  id: string;
  chatRoomId: string;
  authorMemberId: string;
  content: string;
  createdAt: Date;
}

interface UserTable {
  id: string;
  name: string;
}

export type Database = {
  chatRoom: ChatRoomTable[];
  member: MemberTable[];
  message: MessageTable[];
  user: UserTable[];
};

const dialect = new MysqlDialect({
  pool: createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  }),
});

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export const db = new Kysely<Database>({
  dialect,
});
