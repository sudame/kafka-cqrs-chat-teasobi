import { ChatRoom } from '../chatRoom';

export interface System {
  rooms: Record<string, ChatRoom>;
}

export function shouldHasRoom(system: System, roomId: string): boolean {
  return system.rooms[roomId] != null;
}
