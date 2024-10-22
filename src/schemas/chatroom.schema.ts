import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema()
export class ChatRoom extends Document {
  @Prop({ required: true })
  doctorId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Message' }],
    required: true,
  })
  messages: MongooseSchema.Types.ObjectId[];
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
