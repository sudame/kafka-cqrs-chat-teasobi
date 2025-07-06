import { UserEvent } from './events';

// TODO: 別のファイルに移動
export interface PersistenceService<EventTyppe> {
  getEventsById: (id: string) => Promise<EventTyppe[]>;
}

export const userPersistenceService: PersistenceService<UserEvent> = {
  getEventsById: async (_: string): Promise<UserEvent[]> => {
    throw new Error('Method not implemented.');
  },
};
