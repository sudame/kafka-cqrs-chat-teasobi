export interface AggregateDomainObject {
  id: string;
  version: number;
  internal: {
    kafkaLatestOffset: string | null;
  };
}
