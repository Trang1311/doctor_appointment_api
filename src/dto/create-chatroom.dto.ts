import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChatRoomDto {
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  doctorId: string;

  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  userId: string;
}
