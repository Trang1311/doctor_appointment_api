// doctor.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { AvailableSlot } from './availableslot.schema';

@Schema()
export class Doctor extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  specialization: string;

  @Prop({ required: true })
  experience: number;

  @Prop({ required: true })
  qualifications: string;

  @Prop({ required: true })
  clinicAddress: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  contactEmail: string;

  @Prop()
  lifeMotto: string;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'AvailableSlot' }],
    required: true,
  })
  dailySlots: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Topic' }],
    required: true,
  })
  topic: MongooseSchema.Types.ObjectId[];
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);
