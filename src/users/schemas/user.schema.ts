import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  username: string;
  @Prop({ required: true })
  password: string;
  @Prop({required: true, unique: true})
  email: string;
  @Prop()
  phoneNumber: string;
  @Prop()
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
