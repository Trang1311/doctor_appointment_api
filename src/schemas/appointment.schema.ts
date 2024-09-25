import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Doctor } from './doctor.schema';
import { User } from './user.schema';
import { Topic } from './topic.schema';

@Schema()
export class Appointment extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userid: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Doctor', required: true })
  doctorid: Doctor;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  doctorname: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Topic', required: true })
  topic: Topic;
  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  startTime: string;

  @Prop({ required: true })
  endTime: string;
  @Prop({ required: true, enum: ['In-Person', 'Video Call'] })
  appointmentType: string;

  @Prop({
    required: true,
    enum: ['Pending', 'Confirmed', 'Canceled'],
    default: 'Pending',
  })
  status: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
