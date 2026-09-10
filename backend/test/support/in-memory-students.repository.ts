import { randomUUID } from 'node:crypto';
import type { StudentRecord } from '../../src/modules/students/domain/student.js';
import { SortOrder } from '../../src/modules/students/dto/list-students-query.dto.js';
import type {
  CreateStudentData,
  FindStudentsQuery,
  StudentsRepository,
  UpdateStudentData,
} from '../../src/modules/students/students.repository.js';

export class InMemoryStudentsRepository implements StudentsRepository {
  private records: StudentRecord[] = [];

  clear(): void {
    this.records = [];
  }

  seed(overrides: Partial<StudentRecord> = {}): StudentRecord {
    const now = new Date('2026-09-10T01:00:00.000Z');
    const record: StudentRecord = {
      birthDate: new Date('2005-05-20T00:00:00.000Z'),
      createdAt: now,
      firstName: 'สมชาย',
      id: randomUUID(),
      lastName: 'ใจดี',
      nickname: 'ชาย',
      updatedAt: now,
      ...overrides,
    };
    this.records.push(record);
    return record;
  }

  snapshot(): StudentRecord[] {
    return structuredClone(this.records);
  }

  async create(data: CreateStudentData): Promise<StudentRecord> {
    return this.seed(data);
  }

  async createMany(data: CreateStudentData[]): Promise<StudentRecord[]> {
    return data.map((item) => this.seed(item));
  }

  async delete(id: string): Promise<boolean> {
    const index = this.records.findIndex((record) => record.id === id);
    if (index === -1) return false;
    this.records.splice(index, 1);
    return true;
  }

  async findById(id: string): Promise<StudentRecord | null> {
    return this.records.find((record) => record.id === id) ?? null;
  }

  async findMany(
    query: FindStudentsQuery,
  ): Promise<{ items: StudentRecord[]; total: number }> {
    const search = query.search?.toLocaleLowerCase('th');
    const filtered = search
      ? this.records.filter((record) =>
          [record.firstName, record.lastName, record.nickname].some((value) =>
            value.toLocaleLowerCase('th').includes(search),
          ),
        )
      : [...this.records];

    filtered.sort((left, right) => {
      const leftValue = left[query.sort];
      const rightValue = right[query.sort];
      const comparison =
        leftValue instanceof Date && rightValue instanceof Date
          ? leftValue.getTime() - rightValue.getTime()
          : String(leftValue).localeCompare(String(rightValue), 'th');
      return query.order === SortOrder.ASC ? comparison : -comparison;
    });

    const offset = (query.page - 1) * query.limit;
    return {
      items: filtered.slice(offset, offset + query.limit),
      total: filtered.length,
    };
  }

  async update(
    id: string,
    data: UpdateStudentData,
  ): Promise<StudentRecord | null> {
    const record = await this.findById(id);
    if (!record) return null;
    Object.assign(record, data, { updatedAt: new Date() });
    return record;
  }
}
