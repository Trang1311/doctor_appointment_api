import { Injectable, Inject, forwardRef } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatRoomService } from '../chatroom/chatroom.service';
import { Message } from '../schemas/message.schema';

@WebSocketGateway({ cors: true })
export class MyGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private clientIpMap = new Map<string, string>();

  constructor(
    @Inject(forwardRef(() => ChatRoomService))
    private readonly chatRoomService: ChatRoomService,
  ) {}

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  handleConnection(client: Socket) {
    const ip =
      client.handshake.headers['x-forwarded-for'] ||
      client.request.connection.remoteAddress;
    console.log(`Client connected: IP ${ip}, Socket ID: ${client.id}`);
    this.clientIpMap.set(client.id, ip as string);

    client.on('joinRoom', (roomId: string) => {
      client.join(roomId); // Join the specified room
      console.log(`Client ${client.id} joined room: ${roomId}`);
    });
  }

  handleDisconnect(client: Socket) {
    const ip = this.clientIpMap.get(client.id);
    console.log(`Client disconnected: IP ${ip}, Socket ID: ${client.id}`);
    this.clientIpMap.delete(client.id);
  }

  notifyChatRoomCreated(chatRoom: any) {
    this.server.emit('chatRoomCreated', chatRoom);
  }

  notifyNewMessage(message: Message, chatRoomId: string) {
    this.server.to(chatRoomId).emit('newMessage', message);
  }
}
