import { IsDateString, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAvailableSlotDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  startTime: string;

  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  endTime: string;
}
export class UpdateAvailableSlotDto {
  @IsString()
  startTime?: string;

  @IsString()
  endTime?: string;

  @IsDateString()
  date?: Date;
}
