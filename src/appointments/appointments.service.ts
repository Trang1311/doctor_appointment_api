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

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<Appointment>,
    private readonly mailerService: MailerService,
  ) {}

  // Create a new appointment
  async createAppointment(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    const { doctorid, userid, date, startTime, endTime, ...rest } =
      createAppointmentDto;
    const appointmentDate = new Date(`${date}T${startTime}:00`);

    // Check if the appointment slot is already booked
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

    // Create new appointment
    const newAppointment = new this.appointmentModel({
      ...rest,
      userid,
      doctorid,
      date: appointmentDate,
      startTime,
      endTime,
    });

    // Send confirmation email to the user
    await this.sendAppointmentEmail(newAppointment);

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

    if (updateAppointmentDto.status === 'Confirmed') {
      await this.sendConfirmationEmail(appointment);
    }

    return appointment;
  }

  async findAppointmentsByUserId(userid: string): Promise<Appointment[]> {
    return this.appointmentModel.find({ userid }).exec();
  }

  async findAppointmentsByDoctorId(doctorid: string): Promise<Appointment[]> {
    return this.appointmentModel.find({ doctorid }).exec();
  }

  private async sendAppointmentEmail(appointment: Appointment): Promise<void> {
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
        to: 'trang1311.proxy@gmail.com',
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
  private async sendConfirmationEmail(appointment: Appointment): Promise<void> {
    const { doctorname, username, date, startTime, endTime, appointmentType } =
      appointment;
    try {
      await this.mailerService.sendMail({
        to: 'trang1311.proxy@gmail.com',
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
}
