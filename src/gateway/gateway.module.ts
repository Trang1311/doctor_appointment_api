import { Module } from '@nestjs/common';
import { MyGateway } from './gateway';
import { ChatRoomModule } from '../chatroom/chatroom.module'; 

@Module({
  imports: [
    ChatRoomModule, 
  ],
  providers: [MyGateway], 
  exports: [MyGateway], 
})
export class GatewayModule {}
