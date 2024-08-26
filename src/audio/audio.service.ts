import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Audio, AudioDocument } from '../schemas/audio.schema';
import { CreateAudioDto } from '../dto/audio.dto';

@Injectable()
export class AudioService {
  constructor(
    @InjectModel('Audio') private readonly audioModel: Model<AudioDocument>, // Sử dụng tên mô hình chính xác
  ) {}

  async createAudio(createAudioDto: CreateAudioDto): Promise<Audio> {
    const createdAudio = new this.audioModel(createAudioDto);
    return createdAudio.save();
  }

  async updateAudio(id: string, updateDto: Partial<CreateAudioDto>): Promise<Audio> {
    return this.audioModel.findOneAndUpdate({ id }, updateDto, { new: true }).exec();
  }

  async deleteAudio(id: string): Promise<any> {
    return this.audioModel.deleteOne({ id }).exec();
  }

  async playAudio(id: string): Promise<string> {
    const audio = await this.audioModel.findOne({ id }).exec();
    if (!audio) {
      throw new Error('Audio not found');
    }
    return `http://localhost:3000/sounds/${audio.filePath}`;
  }

  async adjustVolume(id: string, volume: number): Promise<string> {
    const updatedAudio = await this.audioModel.findOneAndUpdate(
      { id },
      { volume },
      { new: true },
    ).exec();
    return `Volume adjusted to ${updatedAudio.volume}`;
  }

  async stopAudio(id: string): Promise<string> {
    return `Audio with id: ${id} stopped`;
  }
}
