import { IsString, IsDate, IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'User ID associated with the appointment' })
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Doctor ID associated with the appointment' })
  @IsMongoId()
  @IsNotEmpty()
  doctorId: string;

  @ApiProperty({ description: 'Topic ID associated with the appointment' })
  @IsMongoId()
  @IsNotEmpty()
  topicId: string;

  @ApiProperty({ description: 'Appointment date' })
  @IsDate()
  @IsNotEmpty()
  appointmentDate: Date;

  @ApiProperty({ description: 'Appointment time slot, e.g., "10:00 AM - 11:00 AM"' })
  @IsString()
  @IsNotEmpty()
  appointmentTimeSlot: string;

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
