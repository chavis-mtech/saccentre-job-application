import { Inject, Injectable, NotImplementedException } from '@nestjs/common';
import type { Student, StudentPage } from './domain/student.js';
import type { CreateStudentDto } from './dto/create-student.dto.js';
import type { ListStudentsQueryDto } from './dto/list-students-query.dto.js';
import type { UpdateStudentDto } from './dto/update-student.dto.js';
import {
  STUDENTS_REPOSITORY,
  type StudentsRepository,
} from './students.repository.js';

@Injectable()
export class StudentsService {
  constructor(
    @Inject(STUDENTS_REPOSITORY)
    private readonly repository: StudentsRepository,
  ) {}

  create(_input: CreateStudentDto): Promise<Student> {
    throw new NotImplementedException('TODO: implement StudentsService.create');
  }

  findAll(_query: ListStudentsQueryDto): Promise<StudentPage> {
    throw new NotImplementedException(
      'TODO: implement StudentsService.findAll',
    );
  }

  findOne(_id: string): Promise<Student> {
    throw new NotImplementedException(
      'TODO: implement StudentsService.findOne',
    );
  }

  update(_id: string, _input: UpdateStudentDto): Promise<Student> {
    throw new NotImplementedException('TODO: implement StudentsService.update');
  }

  remove(_id: string): Promise<void> {
    throw new NotImplementedException('TODO: implement StudentsService.remove');
  }
}
