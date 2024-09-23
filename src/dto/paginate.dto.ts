import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaginateDto {
  @ApiProperty({ type: Number })
  @IsNotEmpty()
  current: number;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  limit: number;
}

export class PaginateWithSearch extends PaginateDto {
  @ApiProperty({ type: String, required: false })
  Search?: string;
}
