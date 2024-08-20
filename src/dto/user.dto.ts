import { IsString, IsEmail, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'User email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'User first name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'User last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'User gender' })
  @IsEnum(['Male', 'Female', 'Other'])
  @IsOptional()
  gender?: string;

  @ApiProperty({ description: 'User date of birth' })
  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiProperty({ description: 'User phone number' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;
}

export class UpdateUserDto {
  @ApiProperty({ description: 'User first name' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ description: 'User last name' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ description: 'User gender' })
  @IsEnum(['Male', 'Female', 'Other'])
  @IsOptional()
  gender?: string;

  @ApiProperty({ description: 'User phone number' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;
}
