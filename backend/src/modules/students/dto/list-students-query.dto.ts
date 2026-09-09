import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export enum StudentSortField {
  CREATED_AT = 'createdAt',
  FIRST_NAME = 'firstName',
  LAST_NAME = 'lastName',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class ListStudentsQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20, maximum: 100, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    default: StudentSortField.CREATED_AT,
    enum: StudentSortField,
  })
  @IsEnum(StudentSortField)
  sort = StudentSortField.CREATED_AT;

  @ApiPropertyOptional({ default: SortOrder.DESC, enum: SortOrder })
  @IsEnum(SortOrder)
  order = SortOrder.DESC;
}
