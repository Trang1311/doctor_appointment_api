import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { Doctor, DoctorSchema } from '../schemas/doctor.schema';
import { Appointment, AppointmentSchema } from '../schemas/appointment.schema';
import { AvailableSlot, AvailableSlotSchema } from '../schemas/availableslot.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Doctor.name, schema: DoctorSchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: AvailableSlot.name, schema: AvailableSlotSchema },
    ]),
  ],
  providers: [DoctorService],
  controllers: [DoctorController],
  exports: [DoctorService],
})
export class DoctorModule {}
