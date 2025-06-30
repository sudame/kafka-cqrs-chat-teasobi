import { Kafka, Partitioners } from 'kafkajs';
import { ulid } from 'ulid';
import { DomainObjectId } from '../core/domainObjectId';

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
) => DomainObject;

export interface RebuildDomainObjectArgs<DomainObject, DomainEvent> {
  kafka: Kafka;
  domainObjectId: DomainObjectId;
  /** 再構築の開始時点でのドメインオブジェクト */
  initialDomainObject: DomainObject | null;
  /** 現在のドメインオブジェクトにドメインイベントを適用して、新しいドメインオブジェクトを返す関数 */
  applyFunction: ApplyFunction<DomainObject, DomainEvent>;
}

export async function rebuildDomainObject<DomainObject, DomainEvent>(
  args: RebuildDomainObjectArgs<DomainObject, DomainEvent>,
): Promise<DomainObject | null> {
  console.log({ args });
  const { kafka, domainObjectId, initialDomainObject, applyFunction } = args;

  const admin = kafka.admin();
  await admin.connect();
  const { topics } = await admin.fetchTopicMetadata();
  const targetTopic = topics.find((topic) => topic.name === 'chat-events');
  if (targetTopic == null) {
    return null;
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

  console.log({ targetPartition });

  // このオフセットまでのイベントに基づいてドメインオブジェクトを再構築する
  const offsetNumber = await fetchPartitionOffset(kafka, targetPartition);

  console.log({ offsetNumber });

  // offsetが存在しない => そのドメインオブジェクトに対するイベントは1件も存在しない
  if (offsetNumber == null) {
    return null;
  }

  const consumer = kafka.consumer({
    groupId: `rebuild-aggregate-domain-object-${ulid()}`,
  });
  await consumer.connect();
  await consumer.subscribe({ topic: 'chat-events', fromBeginning: true });

  const events = await new Promise<DomainEvent[]>((resolve) => {
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

        const event: DomainEvent = JSON.parse(message.value.toString());
        events.push(event);

        // オフセットが目標のオフセットを超えたら終了
        const messageOffsetNumber = parseInt(message.offset, 10);
        if (isNaN(messageOffsetNumber)) {
          return;
        }
        if (messageOffsetNumber + 1 >= offsetNumber) {
          resolve(events);
          return;
        }
      },
    });
  });

  await consumer.disconnect();

  console.log({ events });

  if (events.length === 0) {
    return null;
  }

  // イベントを適用してドメインオブジェクトを再構築
  const domainObject = events.reduce(
    (domainObject, domainEvent) => applyFunction(domainObject, domainEvent),
    initialDomainObject,
  );

  console.log({ domainObject });

  return domainObject;
}
