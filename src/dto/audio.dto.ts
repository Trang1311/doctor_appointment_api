import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';
import { appendFile } from 'fs';

export class CreateAudioDto {
    @ApiProperty()
    readonly filePath: string; 
    @ApiProperty() 
    readonly volume: number; 
    @ApiProperty()
    readonly id: string;  
  }
  
export class UpdateAudioDto {
    @IsOptional()
    @IsString()
    filePath?: string;
  
    @IsOptional()
    @IsNumber()
    volume?: number;
  }
