import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatRoomService } from './chatroom.service';
import { ChatRoomController } from './chatroom.controller';
import { ChatRoom, ChatRoomSchema } from '../schemas/chatroom.schema';
import { Message, MessageSchema } from '../schemas/message.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Doctor, DoctorSchema } from 'src/schemas/doctor.schema';
import { GatewayModule } from 'src/gateway/gateway.module'; // Ensure the correct path is used

@Module({
  imports: [
    forwardRef(() => GatewayModule),
    MongooseModule.forFeature([
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: Message.name, schema: MessageSchema },
      { name: User.name, schema: UserSchema },
      { name: Doctor.name, schema: DoctorSchema },
    ]),
  ],
  providers: [ChatRoomService],
  controllers: [ChatRoomController],
  exports: [ChatRoomService],
})
export class ChatRoomModule {}
