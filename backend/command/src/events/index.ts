import { System } from '../domain/system';
import {
  applyPostMessageEventToSystem,
  PostChatMessageEvent,
} from './postChatMessage';

export type SystemEvent = PostChatMessageEvent;

export function applyEventToSystem(system: System, event: SystemEvent) {
  let newSystem: System;

  switch (event.type) {
    case 'PostMessage': {
      newSystem = applyPostMessageEventToSystem(system, event);
      break;
    }
    default: {
      console.warn(`Unknown event type: ${event.type}`);
      newSystem = system;
      break;
    }
  }

  return newSystem;
}
