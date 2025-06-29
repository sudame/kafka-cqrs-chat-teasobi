import { Kafka, Partitioners } from 'kafkajs';
import { ulid } from 'ulid';
import { DomainObjectId } from '../core/domainObjectId';

const partitioner = Partitioners.DefaultPartitioner();

async function fetchPartitionOffset(
  kafka: Kafka,
  partition: number,
): Promise<string | null> {
  const admin = kafka.admin();

  await admin.connect();
  const offsets = await admin.fetchTopicOffsets('chat-events');
  await admin.disconnect();

  const offset = offsets.find((o) => o.partition === partition);

  return offset?.offset ?? null;
}

/** 現在のドメインオブジェクトにドメインイベントを適用して、新しいドメインオブジェクトを返す関数 */
export type ApplyFunction<DomainObject, DomainEvent> = (
  domainObject: DomainObject,
  domainEvent: DomainEvent,
) => DomainObject;

export interface RebuildDomainObjectArgs<DomainObject, DomainEvent> {
  kafka: Kafka;
  domainObjectId: DomainObjectId;
  /** 再構築の開始時点でのドメインオブジェクト */
  initialDomainObject: DomainObject;
  /** 現在のドメインオブジェクトにドメインイベントを適用して、新しいドメインオブジェクトを返す関数 */
  applyFunction: ApplyFunction<DomainObject, DomainEvent>;
}

export async function rebuildDomainObject<DomainObject, DomainEvent>(
  args: RebuildDomainObjectArgs<DomainObject, DomainEvent>,
): Promise<DomainObject | null> {
  const { kafka, domainObjectId, initialDomainObject, applyFunction } = args;

  const targetPartition = partitioner({
    topic: 'chat-events',
    message: {
      key: domainObjectId,
      value: null, // partitionの決定にvalueは不要
    },
    partitionMetadata: [], // partitionの決定にvalueは不要
  });

  // このオフセットまでのイベントに基づいてドメインオブジェクトを再構築する
  const offset = await fetchPartitionOffset(kafka, targetPartition);

  // offsetが存在しない => そのドメインオブジェクトに対するイベントは1件も存在しない
  if (offset == null) {
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
        if (message.offset >= offset) {
          resolve(events);
          return;
        }
      },
    });
  });

  await consumer.disconnect();

  if (events.length === 0) {
    return null;
  }

  // イベントを適用してドメインオブジェクトを再構築
  const domainObject = events.reduce(
    (domainObject, domainEvent) => applyFunction(domainObject, domainEvent),
    initialDomainObject,
  );

  return domainObject;
}
