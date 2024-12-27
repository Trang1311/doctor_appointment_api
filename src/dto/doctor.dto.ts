import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CreateAvailableSlotDto } from './availableslot.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDoctorDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 'PTHTrang',
  })
  @IsString()
  name: string;
  @ApiProperty()
  @IsNotEmpty()
  username?: string;
  @ApiProperty()
  @IsNotEmpty()
  password?: string;
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
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  specialization: string;

  @IsNotEmpty()
  @ApiProperty()
  @IsNumber()
  experience: number;

  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  qualifications: string;

  @ApiProperty({
    type: [Object],
  })
  @ValidateNested({ each: true })
  @Type(() => DailySlotDto)
  dailySlots: DailySlotDto[];

  @ApiProperty({
    type: [String],
  })
  @IsString({ each: true })
  topic: string[];

  @ApiProperty()
  @IsString()
  clinicAddress: string;
  @IsOptional()
  @ApiProperty()
  @IsString()
  lifeMotto?: string;

  @ApiProperty()
  imageURL: string;
}

export class DailySlotDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  date: string;

  @IsArray()
  @ApiProperty({
    type: [CreateAvailableSlotDto],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateAvailableSlotDto)
  slots: CreateAvailableSlotDto[];
}

export class UpdateDoctorDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value !== null && value !== undefined ? Number(value) : value,
  )
  @IsNumber({}, { message: 'Experience must be a number' })
  experience?: number;

  @IsOptional()
  @IsString()
  qualifications?: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  image?: Express.Multer.File;

  @IsOptional()
  imageURL?: string;

  // @ApiProperty({
  //   type: [Object],
  //   required: false, // Make it optional
  // })
  @IsOptional() // Ensure it's optional
  @ValidateNested({ each: true })
  @Type(() => DailySlotDto)
  dailySlots?: DailySlotDto[]; // Make sure it's optional

  // @ApiProperty({
  //   type: [String],
  //   required: false,
  // })
  @IsOptional()
  @IsString({ each: true })
  topic: string[];

  @IsOptional()
  @IsString()
  clinicAddress: string;

  @IsString()
  @IsOptional()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  email: string;

  @IsOptional()
  @IsString()
  lifeMotto?: string;
}
export class RemoveSlotsDto {
  @ApiProperty({
    description: 'The date to remove the doctor\'s available slots',
    example: '2024-12-27',
  })
  date: string;
}