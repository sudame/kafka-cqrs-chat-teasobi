export interface AggregateDomainObject<IdType> {
  id: IdType;
  version: number;

  // スナップショットを実装したら必要になる可能性が高い
  // internal: {
  //   kafkaLatestOffset: string | null;
  // };
}
