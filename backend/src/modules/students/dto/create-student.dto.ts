import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ example: 'สมชาย', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/u)
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: 'ใจดี', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/u)
  @MaxLength(100)
  lastName!: string;

  @ApiProperty({ example: 'ชาย', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/u)
  @MaxLength(50)
  nickname!: string;

  @ApiProperty({ example: '2005-05-20', format: 'date' })
  @IsDateString({ strict: true })
  birthDate!: string;
}
