import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsString, IsOptional } from 'class-validator';

export class usersDTO {
  @ApiProperty()
  @IsNotEmpty()
  username?: string;
  @ApiProperty()
  password?: string;
  @ApiProperty()
  @IsOptional()
  name: string;
  @ApiProperty()
  @IsEmail()
  email?: string;
  @ApiProperty()
  gender?: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  phoneNumber?: string;
  @IsOptional()
  role?: string;
  
}
