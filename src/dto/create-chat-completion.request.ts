import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class CreateChatCompletionRequest {
  @IsArray()
  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => ChatCompletionMessageDto)
  messages: ChatCompletionMessageDto[];
}

export class ChatCompletionMessageDto {
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  role: string;

  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  content: string;
}
