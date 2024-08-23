import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitMQConsumer } from './consumer.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://127.0.0.1:5672'],
          queue: 'topic_queue',
          queueOptions: {
            durable: false,
            autoDelete: false,
          },
        },
      },
    ]),
  ],
  controllers: [RabbitMQConsumer],
})
export class RabbitMQModule {}
