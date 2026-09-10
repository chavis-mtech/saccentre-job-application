import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Student, StudentPage, StudentRecord } from './domain/student.js';
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

  async create(input: CreateStudentDto): Promise<Student> {
    return this.toStudent(
      await this.repository.create(this.toCreateData(input)),
    );
  }

  async createMany(inputs: CreateStudentDto[]): Promise<Student[]> {
    const records = await this.repository.createMany(
      inputs.map((input) => this.toCreateData(input)),
    );
    return records.map((record) => this.toStudent(record));
  }

  async findAll(query: ListStudentsQueryDto): Promise<StudentPage> {
    const { search: searchInput, ...baseQuery } = query;
    const search = searchInput?.trim();
    const normalizedQuery = search ? { ...baseQuery, search } : baseQuery;

    const { items, total } = await this.repository.findMany(normalizedQuery);
    return {
      data: items.map((record) => this.toStudent(record)),
      meta: {
        limit: query.limit,
        page: query.page,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findOne(id: string): Promise<Student> {
    const record = await this.repository.findById(id);
    if (!record) throw new NotFoundException('Student not found');
    return this.toStudent(record);
  }

  async update(id: string, input: UpdateStudentDto): Promise<Student> {
    if (Object.keys(input).length === 0) {
      throw new BadRequestException('At least one field is required');
    }

    const data = {
      ...(input.birthDate
        ? { birthDate: this.toBirthDate(input.birthDate) }
        : {}),
      ...(input.firstName !== undefined
        ? { firstName: input.firstName.trim() }
        : {}),
      ...(input.lastName !== undefined
        ? { lastName: input.lastName.trim() }
        : {}),
      ...(input.nickname !== undefined
        ? { nickname: input.nickname.trim() }
        : {}),
    };
    const record = await this.repository.update(id, data);
    if (!record) throw new NotFoundException('Student not found');
    return this.toStudent(record);
  }

  async remove(id: string): Promise<void> {
    if (!(await this.repository.delete(id))) {
      throw new NotFoundException('Student not found');
    }
  }

  private toBirthDate(value: string): Date {
    const date = new Date(`${value}T00:00:00.000Z`);
    if (date > new Date()) {
      throw new BadRequestException('Birth date cannot be in the future');
    }
    return date;
  }

  private toCreateData(input: CreateStudentDto) {
    return {
      birthDate: this.toBirthDate(input.birthDate),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      nickname: input.nickname.trim(),
    };
  }

  private toStudent(record: StudentRecord): Student {
    return {
      ...record,
      birthDate: record.birthDate.toISOString().slice(0, 10),
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}
