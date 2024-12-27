import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User, UserSchema } from '../schemas/user.schema';
import { Doctor, DoctorSchema } from '../schemas/doctor.schema';
import { Appointment, AppointmentSchema } from '../schemas/appointment.schema';
import { Topic, TopicSchema } from '../schemas/topic.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Doctor.name, schema: DoctorSchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Topic.name, schema: TopicSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
