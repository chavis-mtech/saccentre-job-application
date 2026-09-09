import type { Student } from "../types";

export const STUDENT_ID = "11111111-1111-4111-8111-111111111111";

export function student(overrides: Partial<Student> = {}): Student {
  return {
    birthDate: "2005-05-20",
    createdAt: "2026-09-10T01:00:00.000Z",
    firstName: "สมชาย",
    id: STUDENT_ID,
    lastName: "ใจดี",
    nickname: "ชาย",
    updatedAt: "2026-09-10T01:00:00.000Z",
    ...overrides,
  };
}
