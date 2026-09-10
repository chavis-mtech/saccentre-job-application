import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateStudentDto } from './create-student.dto.js';
import { CreateStudentsDto } from './create-students.dto.js';
import {
  ListStudentsQueryDto,
  SortOrder,
  StudentSortField,
} from './list-students-query.dto.js';
import { UpdateStudentDto } from './update-student.dto.js';

async function errorsFor<T extends object>(type: new () => T, input: object) {
  return validate(plainToInstance(type, input));
}

describe('CreateStudentDto', () => {
  const validInput = {
    birthDate: '2005-05-20',
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    nickname: 'ชาย',
  };

  it('accepts a valid Thai student', async () => {
    expect(await errorsFor(CreateStudentDto, validInput)).toHaveLength(0);
  });

  it.each(['firstName', 'lastName', 'nickname', 'birthDate'] as const)(
    'rejects a missing %s',
    async (field) => {
      const input = { ...validInput };
      delete input[field];

      expect(await errorsFor(CreateStudentDto, input)).not.toHaveLength(0);
    },
  );

  it.each(['firstName', 'lastName', 'nickname'] as const)(
    'rejects an empty %s',
    async (field) => {
      expect(
        await errorsFor(CreateStudentDto, { ...validInput, [field]: '' }),
      ).not.toHaveLength(0);
    },
  );

  it('rejects a first name longer than 100 characters', async () => {
    expect(
      await errorsFor(CreateStudentDto, {
        ...validInput,
        firstName: 'ก'.repeat(101),
      }),
    ).not.toHaveLength(0);
  });

  it('rejects a last name longer than 100 characters', async () => {
    expect(
      await errorsFor(CreateStudentDto, {
        ...validInput,
        lastName: 'ก'.repeat(101),
      }),
    ).not.toHaveLength(0);
  });

  it('rejects a nickname longer than 50 characters', async () => {
    expect(
      await errorsFor(CreateStudentDto, {
        ...validInput,
        nickname: 'ก'.repeat(51),
      }),
    ).not.toHaveLength(0);
  });

  it.each(['20/05/2005', '2005-13-01', 'not-a-date'])(
    'rejects invalid birth date %s',
    async (birthDate) => {
      expect(
        await errorsFor(CreateStudentDto, { ...validInput, birthDate }),
      ).not.toHaveLength(0);
    },
  );
});

describe('UpdateStudentDto', () => {
  it('accepts an empty partial update', async () => {
    expect(await errorsFor(UpdateStudentDto, {})).toHaveLength(0);
  });

  it('validates fields that are provided', async () => {
    expect(
      await errorsFor(UpdateStudentDto, { nickname: 'ก'.repeat(51) }),
    ).not.toHaveLength(0);
  });
});

describe('CreateStudentsDto', () => {
  const student = {
    birthDate: '2005-05-20',
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    nickname: 'ชาย',
  };

  it('accepts multiple valid rows', async () => {
    expect(
      await errorsFor(CreateStudentsDto, { students: [student, student] }),
    ).toHaveLength(0);
  });

  it('rejects an empty list', async () => {
    expect(
      await errorsFor(CreateStudentsDto, { students: [] }),
    ).not.toHaveLength(0);
  });

  it('validates every row', async () => {
    expect(
      await errorsFor(CreateStudentsDto, {
        students: [student, { ...student, firstName: '' }],
      }),
    ).not.toHaveLength(0);
  });
});

describe('ListStudentsQueryDto', () => {
  it('applies stable pagination and sorting defaults', async () => {
    const query = plainToInstance(ListStudentsQueryDto, {});

    expect(await validate(query)).toHaveLength(0);
    expect(query).toMatchObject({
      limit: 20,
      order: SortOrder.DESC,
      page: 1,
      sort: StudentSortField.CREATED_AT,
    });
  });

  it('converts page and limit query strings to numbers', async () => {
    const query = plainToInstance(ListStudentsQueryDto, {
      limit: '10',
      page: '2',
    });

    expect(await validate(query)).toHaveLength(0);
    expect(query.page).toBe(2);
    expect(query.limit).toBe(10);
  });

  it.each([0, -1, 1.5])('rejects invalid page %s', async (page) => {
    expect(await errorsFor(ListStudentsQueryDto, { page })).not.toHaveLength(0);
  });

  it.each([0, 101, 1.5])('rejects invalid limit %s', async (limit) => {
    expect(await errorsFor(ListStudentsQueryDto, { limit })).not.toHaveLength(
      0,
    );
  });

  it('rejects an unsupported sort field', async () => {
    expect(
      await errorsFor(ListStudentsQueryDto, { sort: 'nickname' }),
    ).not.toHaveLength(0);
  });

  it('rejects an unsupported sort order', async () => {
    expect(
      await errorsFor(ListStudentsQueryDto, { order: 'random' }),
    ).not.toHaveLength(0);
  });

  it('rejects search text longer than 100 characters', async () => {
    expect(
      await errorsFor(ListStudentsQueryDto, { search: 'ก'.repeat(101) }),
    ).not.toHaveLength(0);
  });
});
