// src/schemas/availableslot.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class AvailableSlot extends Document {
  @Prop({ required: true })
  startTime: string;

  @Prop({ required: true })
  endTime: string;

  @Prop({ required: true })
  date: Date; // Ensure this field is included
}

export const AvailableSlotSchema = SchemaFactory.createForClass(AvailableSlot);
