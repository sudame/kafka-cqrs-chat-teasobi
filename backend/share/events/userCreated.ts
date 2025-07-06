export type UserCreatedEvent = {
  type: 'user-created';
  user: {
    name: string;
    createdAt: number;
    id: string;
    version: number;
  };
  createdAt: number;
  toVersion: number;
};

export function userCreatedEventToKafkaMessage(event: UserCreatedEvent): {
  key: string;
  value: string;
} {
  return {
    key: event.user.id,
    value: JSON.stringify(event),
  };
}

export function kafkaMessageToUserCreatedEvent(
  value: string,
): UserCreatedEvent {
  const event = JSON.parse(value) as UserCreatedEvent;
  if (event.type !== 'user-created') {
    throw new Error('Invalid event type');
  }
  return event;
}
