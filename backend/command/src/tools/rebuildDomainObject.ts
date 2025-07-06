import { ChatEvent } from '@share/events';
import { kafkaMessageToEvent } from '@share/kafkaMessaageToEvent';
import { Kafka, Partitioners } from 'kafkajs';
import { err, ok, Result } from 'neverthrow';
import { ulid } from 'ulid';

async function fetchPartitionOffset(
  kafka: Kafka,
  partition: number,
): Promise<number | null> {
  const admin = kafka.admin();

  await admin.connect();
  const offsets = await admin.fetchTopicOffsets('chat-events');
  await admin.disconnect();

  const offset = offsets.find((o) => o.partition === partition);

  if (offset?.high == null) {
    return null;
  }

  const offsetNumber = parseInt(offset.high, 10);
  if (isNaN(offsetNumber)) {
    return null;
  }

  return offsetNumber;
}

/** 現在のドメインオブジェクトにドメインイベントを適用して、新しいドメインオブジェクトを返す関数 */
export type ApplyFunction<DomainObject, DomainEvent> = (
  domainObject: DomainObject | null,
  domainEvent: DomainEvent,
  deps: { kafka: Kafka },
) => Promise<Result<DomainObject, Error>>;

export interface RebuildDomainObjectArgs<
  DomainObject,
  DomainEvent extends ChatEvent,
> {
  kafka: Kafka;
  domainObjectId: string;
  /** 再構築の開始時点でのドメインオブジェクト */
  initialDomainObject: DomainObject | null;
  /** 現在のドメインオブジェクトにドメインイベントを適用して、新しいドメインオブジェクトを返す関数 */
  applyFunction: ApplyFunction<DomainObject, DomainEvent>;
}

export async function rebuildDomainObject<
  DomainObject,
  DomainEvent extends ChatEvent,
>(
  args: RebuildDomainObjectArgs<DomainObject, DomainEvent>,
): Promise<Result<DomainObject, Error>> {
  const { kafka, domainObjectId, initialDomainObject, applyFunction } = args;

  const admin = kafka.admin();
  await admin.connect();
  const { topics } = await admin.fetchTopicMetadata();
  const targetTopic = topics.find((topic) => topic.name === 'chat-events');
  if (targetTopic == null) {
    return err(new Error('Target topic "chat-events" not found.'));
  }

  const partitioner = Partitioners.DefaultPartitioner();
  const targetPartition = partitioner({
    topic: 'chat-events',
    message: {
      key: domainObjectId,
      value: null, // partitionの決定にvalueは不要
    },
    partitionMetadata: targetTopic.partitions,
  });

  // このオフセットまでのイベントに基づいてドメインオブジェクトを再構築する
  const offsetNumber = await fetchPartitionOffset(kafka, targetPartition);

  // offsetが存在しない => そのドメインオブジェクトに対するイベントは1件も存在しない
  if (offsetNumber == null) {
    return err(new Error('No events found for the specified domain object.'));
  }

  const consumer = kafka.consumer({
    groupId: `rebuild-aggregate-domain-object-${ulid()}`,
  });
  await consumer.connect();
  await consumer.subscribe({ topic: 'chat-events', fromBeginning: true });

  const loadEvents = () =>
    new Promise<DomainEvent[]>((resolve, reject) => {
      const events: DomainEvent[] = [];

      consumer.run({
        eachMessage: async ({ message, partition }) => {
          // 不正なイベントは無視
          if (message.key == null || message.value == null) {
            return;
          }

          // 再構築するドメインオブジェクトと無関係なイベントは無視
          if (
            partition !== targetPartition ||
            message.key.toString() !== domainObjectId
          ) {
            return;
          }

          const kafkaMessageToEventResult = kafkaMessageToEvent(message);
          if (kafkaMessageToEventResult.isErr()) {
            return reject(kafkaMessageToEventResult.error);
          }
          const event = kafkaMessageToEventResult.value as DomainEvent;
          events.push(event);

          // オフセットが目標のオフセットを超えたら終了
          const messageOffsetNumber = parseInt(message.offset, 10);
          if (isNaN(messageOffsetNumber)) {
            return;
          }
          if (messageOffsetNumber + 1 >= offsetNumber) {
            return resolve(events);
          }
        },
      });
    });

  let events: DomainEvent[] = [];
  try {
    events = await loadEvents();
  } catch (error) {
    await consumer.disconnect();
    if (error instanceof Error) return err(error);
    return err(new Error('Unknown error occurred while loading events.'));
  }

  await consumer.disconnect();

  if (events.length === 0) {
    return err(new Error('No events found for the specified domain object.'));
  }

  let domainObject: DomainObject | null = initialDomainObject;
  for (const event of events) {
    const result = await applyFunction(domainObject, event, { kafka });
    if (result.isErr()) {
      return err(result.error);
    }
    domainObject = result.value;
  }

  if (domainObject == null) {
    return err(new Error('Domain object is null after applying events.'));
  }

  return ok(domainObject);
}
