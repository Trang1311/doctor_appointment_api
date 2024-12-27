import { forwardRef, Module } from '@nestjs/common';
import { AppointmentController } from './appointments.controller';
import { AppointmentService } from './appointments.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { MongooseModule } from '@nestjs/mongoose';
import { Appointment, AppointmentSchema } from 'src/schemas/appointment.schema';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
    forwardRef(() => AuthModule),
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
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
})
export class AppointmentsModule {}
