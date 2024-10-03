import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { AvailableSlot } from './availableslot.schema';

@Schema()
export class Doctor extends Document {
  @Prop({ required: true })
  name: string;
  @Prop()
  imageURL: string;
  @Prop({ required: true })
  username: string;
  @Prop({ required: true })
  password: string;
  @Prop({ required: true, unique: true })
  email: string;
  @Prop()
  phoneNumber: string;
  @Prop()
  gender: string;
  @Prop()
  role: string;

  @Prop({ required: true })
  specialization: string;

  @Prop({ required: true })
  experience: number;

  @Prop({ required: true })
  qualifications: string;

  @Prop({ required: true })
  clinicAddress: string;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'AvailableSlot' }],
  })
  dailySlots: AvailableSlot[];

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Topic' }],
    required: true,
  })
  topic: MongooseSchema.Types.ObjectId[];
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);
