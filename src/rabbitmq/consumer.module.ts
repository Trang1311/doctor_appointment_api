import { Module } from '@nestjs/common';
import { RabbitMQConsumer } from '../rabbitmq/consumer.controller';
import { ConsumerService } from '../rabbitmq/consumer.service';

@Module({
  controllers: [RabbitMQConsumer],
  providers: [ConsumerService],
})
export class ConsumerModule {}
