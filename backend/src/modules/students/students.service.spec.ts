import { NotFoundException } from '@nestjs/common';
import { SortOrder, StudentSortField } from './dto/list-students-query.dto.js';
import type { StudentsRepository } from './students.repository.js';
import { StudentsService } from './students.service.js';
import {
  STUDENT_ID,
  studentRecord,
} from '../../../test/fixtures/student.fixture.js';

describe('StudentsService', () => {
  let repository: {
    [K in keyof StudentsRepository]: ReturnType<typeof vi.fn>;
  };
  let service: StudentsService;

  beforeEach(() => {
    repository = {
      create: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    };
    service = new StudentsService(repository as unknown as StudentsRepository);
  });

  describe('create', () => {
    it('trims names and converts a date-only value to UTC', async () => {
      repository.create.mockResolvedValue(studentRecord());

      await service.create({
        birthDate: '2005-05-20',
        firstName: '  สมชาย  ',
        lastName: '  ใจดี ',
        nickname: ' ชาย ',
      });

      expect(repository.create).toHaveBeenCalledWith({
        birthDate: new Date('2005-05-20T00:00:00.000Z'),
        firstName: 'สมชาย',
        lastName: 'ใจดี',
        nickname: 'ชาย',
      });
    });

    it('maps database dates to the public API contract', async () => {
      repository.create.mockResolvedValue(studentRecord());

      await expect(
        service.create({
          birthDate: '2005-05-20',
          firstName: 'สมชาย',
          lastName: 'ใจดี',
          nickname: 'ชาย',
        }),
      ).resolves.toEqual({
        birthDate: '2005-05-20',
        createdAt: '2026-09-10T01:00:00.000Z',
        firstName: 'สมชาย',
        id: STUDENT_ID,
        lastName: 'ใจดี',
        nickname: 'ชาย',
        updatedAt: '2026-09-10T01:00:00.000Z',
      });
    });
  });

  describe('findAll', () => {
    const query = {
      limit: 20,
      order: SortOrder.DESC,
      page: 1,
      sort: StudentSortField.CREATED_AT,
    };

    it('returns an empty page with stable metadata', async () => {
      repository.findMany.mockResolvedValue({ items: [], total: 0 });

      await expect(service.findAll(query)).resolves.toEqual({
        data: [],
        meta: { limit: 20, page: 1, total: 0, totalPages: 0 },
      });
    });

    it('calculates the final partial page', async () => {
      repository.findMany.mockResolvedValue({
        items: [studentRecord()],
        total: 41,
      });

      await expect(service.findAll(query)).resolves.toMatchObject({
        meta: { limit: 20, page: 1, total: 41, totalPages: 3 },
      });
    });

    it('normalizes search text before querying the repository', async () => {
      repository.findMany.mockResolvedValue({ items: [], total: 0 });

      await service.findAll({ ...query, search: '  สมชาย  ' });

      expect(repository.findMany).toHaveBeenCalledWith({
        ...query,
        search: 'สมชาย',
      });
    });

    it('does not send blank search text to the repository', async () => {
      repository.findMany.mockResolvedValue({ items: [], total: 0 });

      await service.findAll({ ...query, search: '   ' });

      expect(repository.findMany).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('returns the requested student', async () => {
      repository.findById.mockResolvedValue(studentRecord());

      await expect(service.findOne(STUDENT_ID)).resolves.toMatchObject({
        id: STUDENT_ID,
        birthDate: '2005-05-20',
      });
    });

    it('throws NotFoundException when the student does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne(STUDENT_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('updates only supplied fields and normalizes their values', async () => {
      repository.update.mockResolvedValue(studentRecord({ nickname: 'ใหม่' }));

      await service.update(STUDENT_ID, { nickname: '  ใหม่  ' });

      expect(repository.update).toHaveBeenCalledWith(STUDENT_ID, {
        nickname: 'ใหม่',
      });
    });

    it('converts an updated birth date to UTC', async () => {
      repository.update.mockResolvedValue(
        studentRecord({ birthDate: new Date('2006-06-21T00:00:00.000Z') }),
      );

      await service.update(STUDENT_ID, { birthDate: '2006-06-21' });

      expect(repository.update).toHaveBeenCalledWith(STUDENT_ID, {
        birthDate: new Date('2006-06-21T00:00:00.000Z'),
      });
    });

    it('returns the updated student contract', async () => {
      repository.update.mockResolvedValue(studentRecord({ nickname: 'ใหม่' }));

      await expect(
        service.update(STUDENT_ID, { nickname: 'ใหม่' }),
      ).resolves.toMatchObject({ id: STUDENT_ID, nickname: 'ใหม่' });
    });

    it('throws NotFoundException when the student does not exist', async () => {
      repository.update.mockResolvedValue(null);

      await expect(
        service.update(STUDENT_ID, { nickname: 'ใหม่' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes the requested student', async () => {
      repository.delete.mockResolvedValue(true);

      await expect(service.remove(STUDENT_ID)).resolves.toBeUndefined();
      expect(repository.delete).toHaveBeenCalledWith(STUDENT_ID);
    });

    it('throws NotFoundException when the student does not exist', async () => {
      repository.delete.mockResolvedValue(false);

      await expect(service.remove(STUDENT_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
