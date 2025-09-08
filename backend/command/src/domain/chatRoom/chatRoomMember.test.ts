import { describe, expect, test } from 'vitest';
import { createChatRoomMember } from './chatRoomMember';
import { generateUserId } from '../user/userId';

describe('ChatRoomMember', () => {
  test('createChatRoomMember creates member with generated memberId', () => {
    const userId = generateUserId();
    const member = createChatRoomMember({ userId });
    
    expect(member.memberId).toBeDefined();
    expect(typeof member.memberId).toBe('string');
    expect(member.memberId.startsWith('member-')).toBe(true);
    expect(member.userId).toBe(userId);
  });
});