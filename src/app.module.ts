import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DoctorModule } from './doctor/doctor.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { TopicModule } from './topic/topic.module';
import { GatewayModule } from './gateway/gateway.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [AuthModule, DoctorModule, AppointmentsModule, TopicModule,GatewayModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/doctor_appointment')
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
