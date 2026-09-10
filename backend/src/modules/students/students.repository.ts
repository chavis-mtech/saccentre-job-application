import type { StudentRecord } from './domain/student.js';
import type {
  SortOrder,
  StudentSortField,
} from './dto/list-students-query.dto.js';

export const STUDENTS_REPOSITORY = Symbol('STUDENTS_REPOSITORY');

export interface CreateStudentData {
  birthDate: Date;
  firstName: string;
  lastName: string;
  nickname: string;
}

export interface UpdateStudentData {
  birthDate?: Date;
  firstName?: string;
  lastName?: string;
  nickname?: string;
}

export interface FindStudentsQuery {
  limit: number;
  order: SortOrder;
  page: number;
  search?: string;
  sort: StudentSortField;
}

export interface StudentsRepository {
  create(data: CreateStudentData): Promise<StudentRecord>;
  createMany(data: CreateStudentData[]): Promise<StudentRecord[]>;
  delete(id: string): Promise<boolean>;
  findById(id: string): Promise<StudentRecord | null>;
  findMany(
    query: FindStudentsQuery,
  ): Promise<{ items: StudentRecord[]; total: number }>;
  update(id: string, data: UpdateStudentData): Promise<StudentRecord | null>;
}
