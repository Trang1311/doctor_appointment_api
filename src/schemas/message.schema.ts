import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema()
export class Message extends Document {
  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  senderId: string;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'ChatRoom' }],
    required: true,
  })
  chatRoom: MongooseSchema.Types.ObjectId[];

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
