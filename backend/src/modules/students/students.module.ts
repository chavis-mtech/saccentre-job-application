import { Module } from '@nestjs/common';
import { PrismaStudentsRepository } from './prisma-students.repository.js';
import { StudentsController } from './students.controller.js';
import { STUDENTS_REPOSITORY } from './students.repository.js';
import { StudentsService } from './students.service.js';

@Module({
  controllers: [StudentsController],
  providers: [
    StudentsService,
    {
      provide: STUDENTS_REPOSITORY,
      useClass: PrismaStudentsRepository,
    },
  ],
})
export class StudentsModule {}
