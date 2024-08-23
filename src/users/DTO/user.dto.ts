import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class usersDTO {
  
  @ApiProperty()
  username?: string;
  @ApiProperty()
  password?: string;

}
