import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AudioController } from './audio.controller';
import { AudioService } from './audio.service';
import { AudioSchema } from '../schemas/audio.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Audio', schema: AudioSchema }]),  
  ],
  controllers: [AudioController],
  providers: [AudioService],
})
export class AudioModule {}
