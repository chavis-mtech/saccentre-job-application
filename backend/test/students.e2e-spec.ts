import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { STUDENTS_REPOSITORY } from '../src/modules/students/students.repository.js';
import { InMemoryStudentsRepository } from './support/in-memory-students.repository.js';

describe('Students API (e2e)', () => {
  let app: INestApplication;
  let repository: InMemoryStudentsRepository;

  const validStudent = {
    birthDate: '2005-05-20',
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    nickname: 'ชาย',
  };

  beforeAll(async () => {
    process.env.DATABASE_URL =
      'postgresql://postgres:postgres@localhost:5432/saccentre_test?schema=public';
    repository = new InMemoryStudentsRepository();
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(STUDENTS_REPOSITORY)
      .useValue(repository)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
        whitelist: true,
      }),
    );
    await app.init();
  });

  beforeEach(() => repository.clear());
  afterAll(() => app.close());

  describe('POST /api/v1/students', () => {
    it('creates a student and returns 201', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/students')
        .send(validStudent)
        .expect(201);

      expect(response.body).toMatchObject(validStudent);
      expect(response.body.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
      expect(response.body.createdAt).toBeTruthy();
      expect(response.body.updatedAt).toBeTruthy();
      expect(repository.snapshot()).toHaveLength(1);
    });

    it('trims surrounding whitespace before persistence', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/students')
        .send({
          ...validStudent,
          firstName: '  สมชาย ',
          lastName: ' ใจดี  ',
          nickname: ' ชาย ',
        })
        .expect(201);

      expect(repository.snapshot()[0]).toMatchObject({
        firstName: 'สมชาย',
        lastName: 'ใจดี',
        nickname: 'ชาย',
      });
    });

    it.each(['firstName', 'lastName', 'nickname', 'birthDate'])(
      'rejects missing %s',
      async (field) => {
        const body: Record<string, string> = { ...validStudent };
        delete body[field];
        await request(app.getHttpServer())
          .post('/api/v1/students')
          .send(body)
          .expect(400);
        expect(repository.snapshot()).toHaveLength(0);
      },
    );

    it.each(['firstName', 'lastName', 'nickname'])(
      'rejects whitespace-only %s',
      async (field) => {
        await request(app.getHttpServer())
          .post('/api/v1/students')
          .send({ ...validStudent, [field]: '   ' })
          .expect(400);
      },
    );

    it.each(['20/05/2005', 'not-a-date', '2005-02-30', '2999-01-01'])(
      'rejects invalid birth date %s',
      async (birthDate) => {
        await request(app.getHttpServer())
          .post('/api/v1/students')
          .send({ ...validStudent, birthDate })
          .expect(400);
      },
    );

    it('rejects properties outside the contract', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/students')
        .send({ ...validStudent, role: 'admin' })
        .expect(400);
    });

    it('escapes rather than executes text supplied as a name', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/students')
        .send({ ...validStudent, firstName: '<script>alert(1)</script>' })
        .expect(201);

      expect(response.body.firstName).toBe('<script>alert(1)</script>');
    });
  });

  describe('GET /api/v1/students', () => {
    it('returns an empty first page', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/students')
        .expect(200);

      expect(response.body).toEqual({
        data: [],
        meta: { limit: 20, page: 1, total: 0, totalPages: 0 },
      });
    });

    it('paginates results and reports total pages', async () => {
      repository.seed({ firstName: 'A' });
      repository.seed({ firstName: 'B' });
      repository.seed({ firstName: 'C' });

      const response = await request(app.getHttpServer())
        .get('/api/v1/students?page=2&limit=2&sort=firstName&order=asc')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].firstName).toBe('C');
      expect(response.body.meta).toEqual({
        limit: 2,
        page: 2,
        total: 3,
        totalPages: 2,
      });
    });

    it.each([
      ['first name', { firstName: 'ค้นหา' }],
      ['last name', { lastName: 'ค้นหา' }],
      ['nickname', { nickname: 'ค้นหา' }],
    ])('searches by %s', async (_label, match) => {
      repository.seed(match);
      repository.seed({ firstName: 'ไม่ตรง' });

      const response = await request(app.getHttpServer())
        .get('/api/v1/students?search=ค้นหา')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
    });

    it.each([
      'page=0',
      'page=1.5',
      'limit=0',
      'limit=101',
      'sort=nickname',
      'order=random',
    ])('rejects invalid query %s', async (query) => {
      await request(app.getHttpServer())
        .get(`/api/v1/students?${query}`)
        .expect(400);
    });
  });

  describe('GET /api/v1/students/:id', () => {
    it('returns one student', async () => {
      const student = repository.seed();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/students/${student.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: student.id,
        firstName: student.firstName,
      });
    });

    it('returns 400 for a malformed UUID', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/students/not-a-uuid')
        .expect(400);
    });

    it('returns 404 for an unknown UUID', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/students/22222222-2222-4222-8222-222222222222')
        .expect(404);
    });
  });

  describe('PATCH /api/v1/students/:id', () => {
    it('updates only the supplied field', async () => {
      const student = repository.seed();

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/students/${student.id}`)
        .send({ nickname: 'คนใหม่' })
        .expect(200);

      expect(response.body).toMatchObject({
        firstName: student.firstName,
        id: student.id,
        nickname: 'คนใหม่',
      });
    });

    it('rejects an empty update', async () => {
      const student = repository.seed();
      await request(app.getHttpServer())
        .patch(`/api/v1/students/${student.id}`)
        .send({})
        .expect(400);
    });

    it('rejects unknown properties', async () => {
      const student = repository.seed();
      await request(app.getHttpServer())
        .patch(`/api/v1/students/${student.id}`)
        .send({ role: 'admin' })
        .expect(400);
    });

    it('returns 404 for an unknown student', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/students/22222222-2222-4222-8222-222222222222')
        .send({ nickname: 'ใหม่' })
        .expect(404);
    });
  });

  describe('DELETE /api/v1/students/:id', () => {
    it('deletes a student and returns no content', async () => {
      const student = repository.seed();

      await request(app.getHttpServer())
        .delete(`/api/v1/students/${student.id}`)
        .expect(204)
        .expect('');

      expect(repository.snapshot()).toHaveLength(0);
    });

    it('returns 404 for an unknown student', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/students/22222222-2222-4222-8222-222222222222')
        .expect(404);
    });
  });
});
