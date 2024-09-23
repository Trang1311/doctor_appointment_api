import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class RabbitMQConsumer {
  @MessagePattern('topic_created')
  async handleMessage(data: any) {
    console.log('Received data:', data);
    return { success: true, data };
  }
}
