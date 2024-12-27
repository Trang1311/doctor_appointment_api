import { applyDecorators, Type as TypeCommon } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  getSchemaPath,
} from '@nestjs/swagger';
import { plainToClass, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsDecimal,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
export abstract class BasePaginateDTO {
  static plainToclass<T>(this: new (...args: any[]) => T, obj: T): T {
    return plainToClass(this, obj, { excludeExtraneousValues: true });
  }
}
export abstract class BaseDTO {
  static plainToclass<T>(this: new (...args: any[]) => T, obj: T): T {
    return plainToClass(this, obj, { excludeExtraneousValues: true });
  }
  // clean
  static clean<T>(this: new (...args: any[]) => T, obj: T): T {
    return plainToClass(this, obj, { excludeExtraneousValues: true });
  }
}
export class paginateDto extends BasePaginateDTO {
  @ApiProperty({ type: Number, required: false })
  @Type(() => Number)
  @IsNumber({}, { message: 'Trang hiện tại không đúng định dạng' })
  @Min(0)
  current?: number = 0;

  @ApiProperty({ type: Number, required: false })
  @Type(() => Number)
  @IsNumber({}, { message: 'Số lượng bản ghi không đúng định dạng' })
  @Min(1)
  limit?: number = 10;
}

export class PaginateWithSearch extends paginateDto {
  @ApiProperty({ required: false })
  @IsOptional()
  Search?: string;
}

export class PaginateWithDate extends PaginateWithSearch {
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @IsOptional()
  @IsDateString()
  EndDate?: string;
}

export class PaginateWithSort extends PaginateWithSearch {
  @ApiProperty({
    type: String,
    description: "Sort order: 'asc' for ascending, 'desc' for descending.",
    required: false,
  })
  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'IsAsc must be either "asc" or "desc".' })
  IsAsc?: string = 'asc';
}

export class PaginateWithFilter extends PaginateWithSort {
  @ApiProperty({
    type: String,
    required: false,
    description: 'Địa chỉ phòng khám, chỉ lấy phần cuối (ví dụ: "bình dương").',
  })
  @IsOptional()
  @IsString()
  clinicAddress?: string;

  @ApiProperty({
    type: Number,
    required: false,
    description: 'Số năm kinh nghiệm (giá trị tối thiểu).',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Giá trị số năm kinh nghiệm không hợp lệ' })
  @Min(0)
  minExperience?: number;

  @ApiProperty({
    type: Number,
    required: false,
    description: 'Số năm kinh nghiệm (giá trị tối đa).',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Giá trị số năm kinh nghiệm không hợp lệ' })
  @Min(0)
  maxExperience?: number;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  topicId?: string
}
