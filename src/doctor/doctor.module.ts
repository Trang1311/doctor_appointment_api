import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { Doctor, DoctorSchema } from '../schemas/doctor.schema';
import { Appointment, AppointmentSchema } from '../schemas/appointment.schema';
import { UsersModule } from '../users/users.module';
import {
  AvailableSlot,
  AvailableSlotSchema,
} from '../schemas/availableslot.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Doctor.name, schema: DoctorSchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: AvailableSlot.name, schema: AvailableSlotSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
  ],
  providers: [DoctorService],
  controllers: [DoctorController],
  exports: [DoctorService],
})
export class DoctorModule {}
