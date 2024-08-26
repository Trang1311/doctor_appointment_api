import { Controller, Post, Delete, Body, Param } from '@nestjs/common';
import { AudioService } from './audio.service';
import { CreateAudioDto } from '../dto/audio.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Audio')
@Controller('audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Post('create')
  async createAudio(@Body() createAudioDto: CreateAudioDto) {
    return this.audioService.createAudio(createAudioDto);
  }

  @Post('update/:id')
  async updateAudio(@Param('id') id: string, @Body() updateDto: Partial<CreateAudioDto>) {
    return this.audioService.updateAudio(id, updateDto);
  }

  @Delete('delete/:id')
  async deleteAudio(@Param('id') id: string) {
    return this.audioService.deleteAudio(id);
  }

  @Post('play/:id')
  async playAudio(@Param('id') id: string) {
    return this.audioService.playAudio(id);
  }

  @Post('adjust-volume/:id')
  async adjustVolume(@Param('id') id: string, @Body('volume') volume: number) {
    return this.audioService.adjustVolume(id, volume);
  }

  @Post('stop/:id')
  async stopAudio(@Param('id') id: string) {
    return this.audioService.stopAudio(id);
  }
}
