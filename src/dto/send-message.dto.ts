import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendMessageDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  senderId: string;

  @IsNotEmpty()
  @ApiProperty()
  chatRoomId: string;
}
