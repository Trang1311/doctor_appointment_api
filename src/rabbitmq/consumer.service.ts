import { Injectable } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Injectable()
export class ConsumerService {
  @EventPattern('topic_created')
  async handleTopicCreated(@Payload() data: any) {
    console.log('Topic created event received:', data);
  }
}
