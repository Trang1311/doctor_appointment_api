import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class RabbitMQConsumer {
  @MessagePattern('topic_created') // tên topic tương ứng với tin nhắn mà bạn đã gửi
  async handleMessage(data: any) {
    console.log('Received data:', data);
    return { success: true, data }; // Trả về phản hồi nếu cần
  }
}
