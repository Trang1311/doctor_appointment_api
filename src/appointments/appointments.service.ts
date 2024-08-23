import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAppointmentDto, UpdateAppointmentDto } from '../dto/appointments.dto';
import { Appointment } from '../schemas/appointment.schema';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel(Appointment.name) private readonly appointmentModel: Model<Appointment>,
    private readonly mailerService: MailerService,
  ) {}

  async createAppointment(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    const { date, startTime, endTime, ...rest } = createAppointmentDto;
    const appointmentDate = new Date(`${date}T${startTime}:00`);
    const existingAppointment = await this.appointmentModel.findOne({
      date: appointmentDate,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (existingAppointment) {
      throw new BadRequestException('The selected time slot is not available. Please choose another time.');
    }

    const newAppointment = new this.appointmentModel({
      ...rest,
      date: appointmentDate,
      startTime,
      endTime,
    });

    await this.sendAppointmentEmail(newAppointment);
    return newAppointment.save();
  }

  async updateAppointment(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.appointmentModel.findByIdAndUpdate(id, updateAppointmentDto, { new: true });

    if (updateAppointmentDto.status === 'Confirmed') {
      await this.sendConfirmationEmail(appointment);
    }

    return appointment;
  }

  private async sendAppointmentEmail(appointment: Appointment): Promise<void> {
    const { doctor, userId, topic, date, startTime, endTime, appointmentType } = appointment;
    try {
      await this.mailerService.sendMail({
        to: 'trang1311.proxy@gmail.com',
        subject: 'Thank You for Your Appointment Booking!',
        template: './thanks',
        context: {
          doctor: doctor,
          topic: topic,
          date: date.toDateString(),
          startTime: startTime,
          endTime: endTime,
          type: appointmentType,
        },
      });
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  private async sendConfirmationEmail(appointment: Appointment): Promise<void> {
    const { date, startTime, endTime, appointmentType } = appointment;
    try {
      await this.mailerService.sendMail({
        to: 'trang1311.proxy@gmail.com',
        subject: 'Appointment Confirmation',
        template: './confirmation',
        context: {
          date: date.toDateString(),
          startTime: startTime,
          endTime: endTime,
          type: appointmentType,
        },
      });
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
