import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  @IsNotEmpty()
  username: string;

  @Prop()
  password: string;

  @Prop()
  name: string;
  @Prop()
  imageURL: string;
  @Prop({ required: true })
  @IsEmail()
  email: string;

  @Prop()
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @Prop()
  gender?: string;

  @Prop({ default: 'doctor' })
  @IsString()
  role?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
