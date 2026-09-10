import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { CreateStudentsDto } from './dto/create-students.dto.js';
import { ListStudentsQueryDto } from './dto/list-students-query.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';
import { StudentsService } from './students.service.js';

@ApiTags('students')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @ApiCreatedResponse()
  create(@Body() input: CreateStudentDto) {
    return this.studentsService.create(input);
  }

  @Post('bulk')
  @ApiCreatedResponse()
  createMany(@Body() input: CreateStudentsDto) {
    return this.studentsService.createMany(input.students);
  }

  @Get()
  @ApiOkResponse()
  findAll(@Query() query: ListStudentsQueryDto) {
    return this.studentsService.findAll(query);
  }

  @Get(':id')
  @ApiOkResponse()
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse()
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() input: UpdateStudentDto,
  ) {
    return this.studentsService.update(id, input);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.studentsService.remove(id);
  }
}
