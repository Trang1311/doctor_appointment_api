import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty,IsEmail, IsString, IsOptional } from 'class-validator';

export class usersDTO {
  
  @ApiProperty()
  @IsNotEmpty()
  username?: string;
  @ApiProperty()
  @IsNotEmpty()
  password?: string;
  @ApiProperty()
  @IsEmail()
  email?:string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  phoneNumber?: string;
}
