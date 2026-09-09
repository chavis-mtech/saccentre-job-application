import { Injectable, NotImplementedException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import type { StudentRecord } from './domain/student.js';
import type {
  CreateStudentData,
  FindStudentsQuery,
  StudentsRepository,
  UpdateStudentData,
} from './students.repository.js';

@Injectable()
export class PrismaStudentsRepository implements StudentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(_data: CreateStudentData): Promise<StudentRecord> {
    throw new NotImplementedException('TODO: implement student creation');
  }

  delete(_id: string): Promise<boolean> {
    throw new NotImplementedException('TODO: implement student deletion');
  }

  findById(_id: string): Promise<StudentRecord | null> {
    throw new NotImplementedException('TODO: implement student lookup');
  }

  findMany(
    _query: FindStudentsQuery,
  ): Promise<{ items: StudentRecord[]; total: number }> {
    throw new NotImplementedException('TODO: implement student listing');
  }

  update(_id: string, _data: UpdateStudentData): Promise<StudentRecord | null> {
    throw new NotImplementedException('TODO: implement student update');
  }
}
