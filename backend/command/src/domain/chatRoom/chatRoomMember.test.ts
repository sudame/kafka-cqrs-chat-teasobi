import { describe, expect, test } from 'vitest';
import { createChatRoomMember } from './chatRoomMember';

describe('ChatRoomMember', () => {
  test('createChatRoomMember creates member with generated memberId', () => {
    const member = createChatRoomMember();
    
    expect(member.memberId).toBeDefined();
    expect(typeof member.memberId).toBe('string');
    expect(member.memberId.startsWith('member-')).toBe(true);
  });
});