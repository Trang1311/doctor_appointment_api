import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from '../dto/appointments.dto';
import { Appointment } from '../schemas/appointment.schema';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from 'src/users/schemas/user.schema';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<Appointment>,
    private readonly mailerService: MailerService,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  // Create a new appointment
  async createAppointment(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    const { doctorid, userid, date, startTime, endTime, ...rest } =
      createAppointmentDto;
    const appointmentDate = new Date(`${date}T${startTime}:00`);
    const existingAppointment = await this.appointmentModel.findOne({
      doctorid: doctorid,
      date: appointmentDate,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (existingAppointment) {
      throw new BadRequestException(
        'The selected time slot is not available. Please choose another time.',
      );
    }
    const user = await this.userModel.findById(userid);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const newAppointment = new this.appointmentModel({
      ...rest,
      userid,
      doctorid,
      date: appointmentDate,
      startTime,
      endTime,
    });
    await this.sendAppointmentEmail(newAppointment, user.email);

    return newAppointment.save();
  }

  async updateAppointment(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    const appointment = await this.appointmentModel.findByIdAndUpdate(
      id,
      updateAppointmentDto,
      { new: true },
    );

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID "${id}" not found`);
    }
    const user = await this.userModel.findById(appointment.userid);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (updateAppointmentDto.status === 'Confirmed') {
      await this.sendConfirmationEmail(appointment, user.email);
    } else if (updateAppointmentDto.status === 'Completed') {
      await this.sendCompletedEmail(appointment, user.email);
    } else if (updateAppointmentDto.status === 'Canceled') {
      await this.sendCanceledEmail(appointment, user.email);
    }

    return appointment;
  }

  async findAppointmentsById(_id: string): Promise<Appointment[]> {
    return this.appointmentModel.find({ _id }).exec();
  }
  async findAppointmentsByUserId(userid: string): Promise<Appointment[]> {
    return this.appointmentModel.find({ userid }).exec();
  }

  async findAppointmentsByDoctorId(doctorid: string): Promise<Appointment[]> {
    return this.appointmentModel.find({ doctorid }).exec();
  }

  private async sendAppointmentEmail(
    appointment: Appointment,
    email: string,
  ): Promise<void> {
    const {
      username,
      doctorname,
      topic,
      date,
      startTime,
      endTime,
      appointmentType,
    } = appointment;
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Thank You for Your Appointment Booking!',
        template: './thanks',
        context: {
          username: username,
          doctorname: doctorname,
          topic: topic,
          date: date.toDateString(),
          startTime: startTime,
          endTime: endTime,
          type: appointmentType,
        },
      });
      console.log('Appointment booking email sent successfully');
    } catch (error) {
      console.error('Error sending appointment booking email:', error);
    }
  }

  private async sendConfirmationEmail(
    appointment: Appointment,
    email: string,
  ): Promise<void> {
    const { doctorname, username, date, startTime, endTime, appointmentType } =
      appointment;
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Appointment Confirmation',
        template: './confirmation',
        context: {
          doctorname: doctorname,
          username: username,
          date: date.toDateString(),
          startTime: startTime,
          endTime: endTime,
          type: appointmentType,
        },
      });
      console.log('Appointment confirmation email sent successfully');
    } catch (error) {
      console.error('Error sending appointment confirmation email:', error);
    }
  }

  private async sendCompletedEmail(
    appointment: Appointment,
    email: string,
  ): Promise<void> {
    const { doctorname, username, date } = appointment;
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Appointment Completed',
        template: './completed',
        context: {
          doctorname,
          username,
          date: date.toDateString(),
        },
      });
      console.log('Appointment completion email sent successfully');
    } catch (error) {
      console.error('Error sending appointment completion email:', error);
    }
  }

  private async sendCanceledEmail(
    appointment: Appointment,
    email: string,
  ): Promise<void> {
    const { doctorname, username, date } = appointment;
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Appointment Canceled',
        template: './canceled',
        context: {
          doctorname,
          username,
          date: date.toDateString(),
        },
      });
      console.log('Appointment cancellation email sent successfully');
    } catch (error) {
      console.error('Error sending appointment cancellation email:', error);
    }
  }
}
