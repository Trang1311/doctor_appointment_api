import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  username?: string;

  @IsOptional()
  password?: string;

  @IsOptional()
  name?: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  image?: Express.Multer.File; // Đây là cách đúng

  @IsOptional()
  imageURL?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsOptional()
  role?: string;
}
