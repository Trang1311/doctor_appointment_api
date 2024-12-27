import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ChatRoomService } from './chatroom.service';
import { CreateChatRoomDto } from '../dto/create-chatroom.dto';
import { SendMessageDto } from '../dto/send-message.dto';
import { ApiTags } from '@nestjs/swagger';
import { Message } from 'src/schemas/message.schema';
import { ChatRoom } from 'src/schemas/chatroom.schema';

@ApiTags('chatrooms')
@Controller('chatrooms')
export class ChatRoomController {
  constructor(private readonly chatRoomService: ChatRoomService) {}

  @Post()
  async createChatRoom(@Body() createChatRoomDto: CreateChatRoomDto) {
    return this.chatRoomService.createChatRoom(createChatRoomDto);
  }

  @Post('messages')
  async sendMessage(@Body() sendMessageDto: SendMessageDto) {
    return this.chatRoomService.sendMessage(sendMessageDto);
  }

  @Get(':id/messages')
  async getMessages(@Param('id') chatRoomId: string): Promise<Message[]> {
    return this.chatRoomService.getMessages(chatRoomId);
  }
  @Get('user/:id')
  async getChatRoomsByUserId(@Param('id') userId: string): Promise<ChatRoom[]> {
    return this.chatRoomService.getChatroomByIdUser(userId);
  }
  @Delete(':id')
  async removeChatRoom(@Param('id') id: string): Promise<void> {
    console.log('ID from route:', id);
    return this.chatRoomService.removeChatroom(id);
  }
}
