import { Body, Controller, Post } from '@nestjs/common';
import { CreateChatCompletionRequest } from '../dto/create-chat-completion.request';
import { OpenaiService } from './openai.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('openai')
@Controller('openai')
export class OpenaiController {
  constructor(private readonly openaiService: OpenaiService) {}

  @Post('chatCompletion')
  async createChatCompletion(@Body() body: CreateChatCompletionRequest) {
    return this.openaiService.createChatCompletion(body.messages);
  }
}
