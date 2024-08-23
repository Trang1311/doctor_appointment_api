import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ unique: true, required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  dateOfBirth: Date;

  @Prop()
  phoneNumber: string;

  @Prop()
  profilePictureUrl: string;

  @Prop()
  oauthProvider: string;

  @Prop()
  oauthId: string;
  @Prop()
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
