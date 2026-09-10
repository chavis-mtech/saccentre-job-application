import { Injectable } from '@nestjs/common';
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

  create(data: CreateStudentData): Promise<StudentRecord> {
    return this.prisma.student.create({ data });
  }

  createMany(data: CreateStudentData[]): Promise<StudentRecord[]> {
    return this.prisma.student.createManyAndReturn({ data });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.prisma.student.deleteMany({ where: { id } });
    return result.count > 0;
  }

  findById(id: string): Promise<StudentRecord | null> {
    return this.prisma.student.findUnique({ where: { id } });
  }

  async findMany(
    query: FindStudentsQuery,
  ): Promise<{ items: StudentRecord[]; total: number }> {
    const where = query.search
      ? {
          OR: [
            {
              firstName: {
                contains: query.search,
                mode: 'insensitive' as const,
              },
            },
            {
              lastName: {
                contains: query.search,
                mode: 'insensitive' as const,
              },
            },
            {
              nickname: {
                contains: query.search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {};
    const items = await this.prisma.student.findMany({
      orderBy: [{ [query.sort]: query.order }, { id: 'asc' }],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      where,
    });
    const total = await this.prisma.student.count({ where });
    return { items, total };
  }

  async update(
    id: string,
    data: UpdateStudentData,
  ): Promise<StudentRecord | null> {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) return null;
    return this.prisma.student.update({ data, where: { id } });
  }
}
