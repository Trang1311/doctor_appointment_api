import { Schema, Document } from 'mongoose';

export const AudioSchema = new Schema({
  filePath: { type: String, required: true },
  volume: { type: Number, default: 1.0 },
  id: { type: String, unique: true, required: true },
});

export interface Audio extends Document {
  filePath: string;
  volume: number;
  id: string;
}

export type AudioDocument = Audio & Document;
