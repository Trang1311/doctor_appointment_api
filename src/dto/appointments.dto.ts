import { IsString, IsDate, IsEnum, IsMongoId, IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'User name associated with the appointment' })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Doctor ID associated with the appointment' })
  @IsMongoId()
  @IsNotEmpty()
  doctor: string;
  @ApiProperty({ description: 'Doctor name associated with the appointment' })
  @IsNotEmpty()
  doctorname: string;

  @ApiProperty({ description: 'Topic ID associated with the appointment' })
  @IsMongoId()
  @IsNotEmpty()
  topic: string;

  @ApiProperty({ description: 'Appointment date in ISO format' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ description: 'Appointment time slot, e.g., "10:00 AM - 11:00 AM"' })
  @IsString()
  @IsNotEmpty()
  startTime: string; 

  @ApiProperty({ description: 'Appointment time slot, e.g., "10:00 AM - 11:00 AM"' })
  @IsString()
  @IsNotEmpty()
  endTime: string;  

  @ApiProperty({ description: 'Appointment type: In-Person or Video Call' })
  @IsEnum(['In-Person', 'Video Call'])
  @IsNotEmpty()
  appointmentType: string;
}

export class UpdateAppointmentDto {
  @ApiProperty({ description: 'Appointment status: Pending, Confirmed, or Canceled' })
  @IsEnum(['Pending', 'Confirmed', 'Canceled'])
  status: string;
}
