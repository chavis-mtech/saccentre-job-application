import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../src/database/prisma.service.js';
import {
  SortOrder,
  StudentSortField,
} from '../src/modules/students/dto/list-students-query.dto.js';
import { PrismaStudentsRepository } from '../src/modules/students/prisma-students.repository.js';

const runDatabaseTests = process.env.RUN_DB_TESTS === 'true';

describe.runIf(runDatabaseTests)(
  'PrismaStudentsRepository (PostgreSQL)',
  () => {
    let prisma: PrismaService;
    let repository: PrismaStudentsRepository;

    beforeAll(async () => {
      const databaseUrl = process.env.DATABASE_URL_TEST;
      if (!databaseUrl || !databaseUrl.toLowerCase().includes('test')) {
        throw new Error(
          'DATABASE_URL_TEST must point to a dedicated test database',
        );
      }

      prisma = new PrismaService({
        getOrThrow: () => databaseUrl,
      } as unknown as ConfigService);
      repository = new PrismaStudentsRepository(prisma);
      await prisma.$connect();
    });

    beforeEach(() => prisma.student.deleteMany());
    afterAll(() => prisma.$disconnect());

    const input = {
      birthDate: new Date('2005-05-20T00:00:00.000Z'),
      firstName: 'สมชาย',
      lastName: 'ใจดี',
      nickname: 'ชาย',
    };

    it('creates and returns a student', async () => {
      const student = await repository.create(input);

      expect(student).toMatchObject(input);
      expect(student.id).toBeTruthy();
      await expect(prisma.student.count()).resolves.toBe(1);
    });

    it('creates multiple students and returns every row', async () => {
      const students = await repository.createMany([
        input,
        { ...input, firstName: 'สุดา', nickname: 'ดา' },
      ]);

      expect(students).toHaveLength(2);
      await expect(prisma.student.count()).resolves.toBe(2);
    });

    it('stores birthDate as a PostgreSQL date without timezone drift', async () => {
      const student = await repository.create(input);
      const rows = await prisma.$queryRaw<Array<{ birth_date: string }>>`
      SELECT birth_date::text AS birth_date
      FROM students
      WHERE id = ${student.id}::uuid
    `;

      expect(rows[0]?.birth_date).toBe('2005-05-20');
    });

    it('allows students with the same names', async () => {
      await repository.create(input);
      await repository.create(input);

      await expect(prisma.student.count()).resolves.toBe(2);
    });

    it('finds a student by id and returns null for an unknown id', async () => {
      const student = await repository.create(input);

      await expect(repository.findById(student.id)).resolves.toMatchObject(
        input,
      );
      await expect(
        repository.findById('22222222-2222-4222-8222-222222222222'),
      ).resolves.toBeNull();
    });

    it('filters first name, last name, and nickname case-insensitively', async () => {
      await repository.create({
        ...input,
        firstName: 'Alice',
        lastName: 'Example',
        nickname: 'ALLY',
      });
      await repository.create({ ...input, firstName: 'Bob' });

      for (const search of ['alice', 'example', 'ally']) {
        const result = await repository.findMany({
          limit: 20,
          order: SortOrder.ASC,
          page: 1,
          search,
          sort: StudentSortField.FIRST_NAME,
        });
        expect(result.total).toBe(1);
        expect(result.items[0]?.firstName).toBe('Alice');
      }
    });

    it('returns a deterministic requested page and the unpaged total', async () => {
      for (const firstName of ['A', 'B', 'C', 'D', 'E']) {
        await repository.create({ ...input, firstName });
      }

      const result = await repository.findMany({
        limit: 2,
        order: SortOrder.ASC,
        page: 2,
        sort: StudentSortField.FIRST_NAME,
      });

      expect(result.total).toBe(5);
      expect(result.items.map((student) => student.firstName)).toEqual([
        'C',
        'D',
      ]);
    });

    it('updates only supplied fields', async () => {
      const student = await repository.create(input);

      const updated = await repository.update(student.id, { nickname: 'ใหม่' });

      expect(updated).toMatchObject({ ...input, nickname: 'ใหม่' });
    });

    it('returns null when updating an unknown student', async () => {
      await expect(
        repository.update('22222222-2222-4222-8222-222222222222', {
          nickname: 'ใหม่',
        }),
      ).resolves.toBeNull();
    });

    it('deletes an existing student and reports missing students', async () => {
      const student = await repository.create(input);

      await expect(repository.delete(student.id)).resolves.toBe(true);
      await expect(repository.delete(student.id)).resolves.toBe(false);
      await expect(prisma.student.count()).resolves.toBe(0);
    });
  },
);
