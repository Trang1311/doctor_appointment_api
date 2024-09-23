import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class MyGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private clientIpMap = new Map<string, string>();

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  handleConnection(client: Socket) {
    const ip =
      client.handshake.headers['x-forwarded-for'] ||
      client.request.connection.remoteAddress;
    console.log(`Client connected: IP ${ip}, Socket ID: ${client.id}`);
    this.clientIpMap.set(client.id, ip as string);
  }

  handleDisconnect(client: Socket) {
    const ip = this.clientIpMap.get(client.id);
    console.log(`Client disconnected: IP ${ip}, Socket ID: ${client.id}`);
    this.clientIpMap.delete(client.id);
  }
}
