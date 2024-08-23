import { Module } from '@nestjs/common';
import { AppointmentController } from './appointments.controller';
import { AppointmentService } from './appointments.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { MongooseModule } from '@nestjs/mongoose';
import { Appointment, AppointmentSchema } from 'src/schemas/appointment.schema';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Appointment.name, schema: AppointmentSchema }]), 
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: 'trangpth2002@gmail.com',
          pass: 'khjc rypr acax iuyh',
        },
      },
      defaults: {
        from: '"no-reply" <no-reply@soulcare.com>',
      },
      template: {
        dir: __dirname + '/templates',
        adapter: new HandlebarsAdapter(), // or another template adapter
        options: {
          strict: true,
        },
      },
    }),
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService]
})
export class AppointmentsModule {}
