import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Topic extends Document {
  @Prop({ unique: true, required: true })
  name: string;

  @Prop()
  description: string;
}

export const TopicSchema = SchemaFactory.createForClass(Topic);
