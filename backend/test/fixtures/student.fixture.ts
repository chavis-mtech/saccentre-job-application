import type { StudentRecord } from '../../src/modules/students/domain/student.js';

export const STUDENT_ID = '11111111-1111-4111-8111-111111111111';

export function studentRecord(
  overrides: Partial<StudentRecord> = {},
): StudentRecord {
  return {
    birthDate: new Date('2005-05-20T00:00:00.000Z'),
    createdAt: new Date('2026-09-10T01:00:00.000Z'),
    firstName: 'สมชาย',
    id: STUDENT_ID,
    lastName: 'ใจดี',
    nickname: 'ชาย',
    updatedAt: new Date('2026-09-10T01:00:00.000Z'),
    ...overrides,
  };
}
