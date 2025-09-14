import type { Result } from 'neverthrow';
import { expect } from 'vitest';
import { createMessage } from '../../message/message';
import { messageContentFromString } from '../../message/messageContent';
import type { User } from '../../user/user';
import type { UserId } from '../../user/userId';
import { generateUserId } from '../../user/userId';
import {
  type ChatRoom,
  type CreateChatRoomOperatorNotInMembersError,
  createChatRoom,
} from '../chatRoom';
import type { ChatRoomId } from '../chatRoomId';
import { generateChatRoomId } from '../chatRoomId';
import { type ChatRoomMember, createChatRoomMember } from '../chatRoomMember';
import { chatRoomNameFromString } from '../chatRoomName';

/**
 * ChatRoomMemberBuilder - メンバー作成を柔軟に行うビルダー
 */
export class ChatRoomMemberBuilder {
  private userId = generateUserId();

  withUserId(userId: UserId) {
    this.userId = userId;
    return this;
  }

  build(): ChatRoomMember {
    return createChatRoomMember({ userId: this.userId });
  }
}

/**
 * ChatRoomBuilder - ChatRoom作成を柔軟に行うビルダー
 */
export class ChatRoomBuilder {
  private name = 'Test Room';
  private operatorUserId = generateUserId();
  private members: ChatRoomMember[] = [];
  private shouldIncludeOperatorInMembers = true;

  withName(name: string) {
    this.name = name;
    return this;
  }

  withOperatorUserId(userId: UserId) {
    this.operatorUserId = userId;
    return this;
  }

  withMembers(...members: ChatRoomMember[]) {
    this.members = members;
    return this;
  }

  withAdditionalMembers(...members: ChatRoomMember[]) {
    this.members.push(...members);
    return this;
  }

  withOperatorNotInMembers() {
    this.shouldIncludeOperatorInMembers = false;
    return this;
  }

  build(): Result<ChatRoom, CreateChatRoomOperatorNotInMembersError> {
    const parsedName = chatRoomNameFromString(this.name)._unsafeUnwrap();

    // デフォルトでオペレーターをメンバーに含める
    if (this.shouldIncludeOperatorInMembers && this.members.length === 0) {
      this.members = [createChatRoomMember({ userId: this.operatorUserId })];
    }

    const initialMembers = new Set(this.members);

    return createChatRoom({
      name: parsedName,
      operatorUserId: this.operatorUserId,
      initialMembers,
    });
  }

  buildUnsafe(): ChatRoom {
    return this.build()._unsafeUnwrap();
  }
}

/**
 * MessageBuilder - メッセージ作成を柔軟に行うビルダー
 */
export class MessageBuilder {
  private author: User | null = null;
  private content = 'Test message';
  private chatRoomId = generateChatRoomId();

  withAuthor(author: User) {
    this.author = author;
    return this;
  }

  withContent(content: string) {
    this.content = content;
    return this;
  }

  withChatRoomId(chatRoomId: ChatRoomId) {
    this.chatRoomId = chatRoomId;
    return this;
  }

  build() {
    if (!this.author) {
      throw new Error('Author must be set before building message');
    }

    const messageContent = messageContentFromString(this.content);
    return createMessage({
      chatRoomId: this.chatRoomId,
      author: this.author,
      content: messageContent,
    });
  }
}

/**
 * ファクトリー関数 - よく使用されるパターンのショートカット
 */
export function aChatRoomMember() {
  return new ChatRoomMemberBuilder();
}

export function aChatRoom() {
  return new ChatRoomBuilder();
}

export function aMessage() {
  return new MessageBuilder();
}

/**
 * 複雑なシナリオ用のファクトリー関数
 */
export function createChatRoomWithMultipleMembers(memberCount = 3) {
  const operatorUserId = generateUserId();
  const members = [createChatRoomMember({ userId: operatorUserId })];

  for (let i = 1; i < memberCount; i++) {
    members.push(createChatRoomMember({ userId: generateUserId() }));
  }

  return aChatRoom()
    .withOperatorUserId(operatorUserId)
    .withMembers(...members)
    .buildUnsafe();
}

export function createChatRoomForOperatorTesting() {
  const operatorUserId = generateUserId();
  const nonOperatorUserId = generateUserId();
  const operatorMember = createChatRoomMember({ userId: operatorUserId });
  const nonOperatorMember = createChatRoomMember({ userId: nonOperatorUserId });

  const chatRoom = aChatRoom()
    .withOperatorUserId(operatorUserId)
    .withMembers(operatorMember, nonOperatorMember)
    .buildUnsafe();

  return {
    chatRoom,
    operatorUserId,
    nonOperatorUserId,
    operatorMember,
    nonOperatorMember,
  };
}

/**
 * エラーアサーションヘルパー
 */
export function expectError<T>(
  result: Result<unknown, T>,
  expectedErrorClass: new (...args: unknown[]) => T,
  expectedMessage: string,
) {
  expect(result.isErr()).toBe(true);
  const error = result._unsafeUnwrapErr();
  expect(error).toBeInstanceOf(expectedErrorClass);
  expect((error as { message: string }).message).toBe(expectedMessage);
}

/**
 * 成功結果のアサーションヘルパー
 */
export function expectSuccess<T>(result: Result<T, unknown>): T {
  expect(result.isOk()).toBe(true);
  return result._unsafeUnwrap();
}
