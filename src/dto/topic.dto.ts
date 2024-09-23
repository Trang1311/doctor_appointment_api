import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTopicDto {
  @ApiProperty({
    description: 'Topic name, e.g., "Anxiety and Stress Management"',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Topic description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  img: string;
}

export class UpdateTopicDto {
  @ApiProperty({ description: 'Topic name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Topic description' })
  @IsString()
  @IsOptional()
  description?: string;
}
