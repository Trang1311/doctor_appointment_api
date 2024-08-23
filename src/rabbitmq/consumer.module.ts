import { Module } from '@nestjs/common';
import { RabbitMQConsumer } from '../rabbitmq/consumer.controller';
import {ConsumerService } from '../rabbitmq/consumer.service'; // nếu có sử dụng

@Module({
  controllers: [RabbitMQConsumer],
  providers: [ConsumerService], // nếu có sử dụng
})
export class ConsumerModule {}
