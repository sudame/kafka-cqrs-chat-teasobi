import { Kafka } from 'kafkajs';
import { err, ok, Result } from 'neverthrow';
import { Message as KafkaMessage } from 'kafkajs';

export const createSendMessageToKafka =
  (kafka: Kafka) =>
  async (message: KafkaMessage): Promise<Result<void, Error>> => {
    const producer = kafka.producer();

    try {
      await producer.connect();
    } catch (error) {
      if (error instanceof Error) return err(error);
      else return err(new Error(`Failed to connect to Kafka: ${error}`));
    }

    try {
      await producer.send({
        topic: 'chat-events',
        messages: [message],
      });
    } catch (error) {
      if (error instanceof Error) return err(error);
      else return err(new Error(`Failed to send message to Kafka: ${error}`));
    }

    return ok();
  };
