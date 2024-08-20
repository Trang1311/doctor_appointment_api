import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Doctor } from './doctor.schema';

@Schema()
export class Appointment extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Doctor', required: true })
  doctor: Doctor;

  @Prop({ required: true })
  userId: string; // The user who booked the appointment

  @Prop({ required: true })
  date: Date; // The date of the appointment

  @Prop({ required: true })
  startTime: string; // E.g., "08:00 AM"

  @Prop({ required: true })
  endTime: string; // E.g., "09:00 AM"
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
