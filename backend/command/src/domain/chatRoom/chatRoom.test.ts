import { describe, expect, test, vi } from 'vitest';
import { createChatRoom } from './chatRoom';
import { chatRoomNameFromString } from './chatRoomName';
import * as chatRoomIdModule from './chatRoomId';

describe('ChatRoom', () => {
  describe('createChatRoom', () => {
    test('should create a new ChatRoom with generated ID', () => {
      const nameResult = chatRoomNameFromString('Test Room');
      expect(nameResult.isOk()).toBe(true);
      
      if (nameResult.isOk()) {
        const chatRoom = createChatRoom({ name: nameResult.value });
        
        expect(chatRoom.id).toBeDefined();
        expect(chatRoom.id).toContain('room-');
        expect(chatRoom.name).toBe(nameResult.value);
      }
    });

    test('should create different IDs for different chat rooms', () => {
      const nameResult1 = chatRoomNameFromString('Room 1');
      const nameResult2 = chatRoomNameFromString('Room 2');
      
      expect(nameResult1.isOk()).toBe(true);
      expect(nameResult2.isOk()).toBe(true);
      
      if (nameResult1.isOk() && nameResult2.isOk()) {
        const chatRoom1 = createChatRoom({ name: nameResult1.value });
        const chatRoom2 = createChatRoom({ name: nameResult2.value });
        
        expect(chatRoom1.id).not.toBe(chatRoom2.id);
        expect(chatRoom1.name).toBe(nameResult1.value);
        expect(chatRoom2.name).toBe(nameResult2.value);
      }
    });

    test('should use generateChatRoomId to create ID', () => {
      const mockId = 'room-01F8MECHZX3TBDSZ7XRADM79XE' as chatRoomIdModule.ChatRoomId;
      const generateSpy = vi.spyOn(chatRoomIdModule, 'generateChatRoomId');
      generateSpy.mockReturnValue(mockId);
      
      const nameResult = chatRoomNameFromString('Mock Room');
      expect(nameResult.isOk()).toBe(true);
      
      if (nameResult.isOk()) {
        const chatRoom = createChatRoom({ name: nameResult.value });
        
        expect(generateSpy).toHaveBeenCalledOnce();
        expect(chatRoom.id).toBe(mockId);
        expect(chatRoom.name).toBe(nameResult.value);
      }
      
      generateSpy.mockRestore();
    });

    test('should create chat room with Japanese name', () => {
      const nameResult = chatRoomNameFromString('開発チーム');
      expect(nameResult.isOk()).toBe(true);
      
      if (nameResult.isOk()) {
        const chatRoom = createChatRoom({ name: nameResult.value });
        
        expect(chatRoom.id).toBeDefined();
        expect(chatRoom.name).toBe(nameResult.value);
      }
    });

    test('should create chat room with special characters in name', () => {
      const nameResult = chatRoomNameFromString('💬 General Chat #1');
      expect(nameResult.isOk()).toBe(true);
      
      if (nameResult.isOk()) {
        const chatRoom = createChatRoom({ name: nameResult.value });
        
        expect(chatRoom.id).toBeDefined();
        expect(chatRoom.name).toBe(nameResult.value);
      }
    });

    test('should create chat room with max length name', () => {
      const maxLengthName = 'a'.repeat(256);
      const nameResult = chatRoomNameFromString(maxLengthName);
      expect(nameResult.isOk()).toBe(true);
      
      if (nameResult.isOk()) {
        const chatRoom = createChatRoom({ name: nameResult.value });
        
        expect(chatRoom.id).toBeDefined();
        expect(chatRoom.name).toBe(nameResult.value);
      }
    });
  });

  describe('ChatRoom type', () => {
    test('should have correct structure', () => {
      const nameResult = chatRoomNameFromString('Type Test Room');
      expect(nameResult.isOk()).toBe(true);
      
      if (nameResult.isOk()) {
        const chatRoom = createChatRoom({ name: nameResult.value });
        
        expect(chatRoom).toHaveProperty('id');
        expect(chatRoom).toHaveProperty('name');
        expect(Object.keys(chatRoom)).toHaveLength(2);
      }
    });
  });
});