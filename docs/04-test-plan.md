# Test Plan

## หลักการ

ชุดทดสอบตั้งใจเริ่มในสถานะ RED เพราะ service, Prisma repository, API client และ UI components เป็น stub การผ่าน test ต้องเกิดจาก implementation จริง ห้ามแก้ test เพียงเพื่อเปลี่ยน expected result เว้นแต่ requirement ถูกเปลี่ยนและบันทึกไว้ก่อน

## Test pyramid

| Layer                   | Scope                           | Database             | Command                               |
| ----------------------- | ------------------------------- | -------------------- | ------------------------------------- |
| Backend unit            | DTO + StudentsService           | ไม่ใช้               | `pnpm --dir backend test`             |
| Backend HTTP e2e        | routing, pipe, status, response | in-memory repository | `pnpm --dir backend test:e2e`         |
| Prisma integration      | query และ PostgreSQL behavior   | dedicated test DB    | `pnpm --dir backend test:integration` |
| Frontend unit/component | API client และ React behavior   | mock fetch/API       | `pnpm --dir client-app test`          |
| Browser e2e             | user CRUD flow และ responsive   | intercepted REST     | `pnpm --dir client-app test:e2e`      |

## Test database safety

ใช้ตัวแปร `DATABASE_URL_TEST` เท่านั้น ชื่อต้องมีคำว่า `test` ก่อน integration suite จะยอมทำงาน ตัวอย่าง:

```text
postgresql://postgres:postgres@localhost:5432/saccentre_test?schema=public
```

สร้างฐานข้อมูล test แยกจาก development แล้ว apply migration ก่อนรัน integration test ห้ามชี้ suite นี้ไปฐานข้อมูล production หรือฐานข้อมูลที่มีข้อมูลจริง

## Coverage catalogue

### Validation — VAL

| ID          | Scenario                                   |
| ----------- | ------------------------------------------ |
| VAL-001     | รับชื่อภาษาไทยครบทุก field                 |
| VAL-002–005 | ปฏิเสธ required field ที่หาย               |
| VAL-006–008 | ปฏิเสธ string ว่างและ whitespace-only      |
| VAL-009–011 | ปฏิเสธ string เกิน database limit          |
| VAL-012     | ปฏิเสธ date format ที่ไม่ใช่ ISO date-only |
| VAL-013     | ปฏิเสธวันที่ไม่มีจริง เช่น 2005-02-30      |
| VAL-014     | ปฏิเสธวันเกิดในอนาคต                       |
| VAL-015     | ปฏิเสธ property นอก allowlist              |
| VAL-016     | update ตรวจเฉพาะ field ที่ส่งมา            |
| VAL-017     | update body ว่างถูกปฏิเสธ                  |

### Service — SVC

| ID          | Scenario                                             |
| ----------- | ---------------------------------------------------- |
| SVC-001     | trim ชื่อก่อน repository call                        |
| SVC-002     | แปลง date-only เป็น UTC Date โดยไม่เลื่อนวัน         |
| SVC-003     | map record เป็น public date contract                 |
| SVC-004     | empty page metadata                                  |
| SVC-005     | totalPages ปัดขึ้น                                   |
| SVC-006     | trim search                                          |
| SVC-007     | ตัด blank search ออกจาก query                        |
| SVC-008     | find existing student                                |
| SVC-009     | find missing student เป็น 404                        |
| SVC-010–012 | partial update, date conversion และ response mapping |
| SVC-013     | update missing student เป็น 404                      |
| SVC-014     | delete existing student                              |
| SVC-015     | delete missing student เป็น 404                      |

### Repository/PostgreSQL — DB

| ID     | Scenario                               |
| ------ | -------------------------------------- |
| DB-001 | create และ UUID persistence            |
| DB-002 | PostgreSQL DATE ไม่เกิด timezone drift |
| DB-003 | ชื่อซ้ำได้                             |
| DB-004 | findById existing/missing              |
| DB-005 | case-insensitive search ครบสาม field   |
| DB-006 | page slice และ unpaged total ถูกต้อง   |
| DB-007 | partial update ไม่ทับ field อื่น       |
| DB-008 | update missing คืน null                |
| DB-009 | delete existing/missing แยกผลได้       |

### HTTP — API

| ID          | Scenario                                             |
| ----------- | ---------------------------------------------------- |
| API-001     | POST success 201 และ response contract               |
| API-002     | normalization ก่อน persistence                       |
| API-003–015 | invalid create requests เป็น 400 โดยไม่สร้างข้อมูล   |
| API-016     | hostile HTML เก็บเป็น text                           |
| API-017     | empty list contract                                  |
| API-018     | pagination + sort                                    |
| API-019–021 | search สาม field                                     |
| API-022–027 | invalid pagination/sort query                        |
| API-028–030 | get existing, malformed UUID, missing UUID           |
| API-031–034 | patch success, empty, unknown field, missing student |
| API-035–036 | delete success 204 และ missing 404                   |

### Frontend API client — WEB-API

| ID              | Scenario                                |
| --------------- | --------------------------------------- |
| WEB-API-001     | list URL ไม่มี dangling `?`             |
| WEB-API-002     | query encoding รองรับภาษาไทยและช่องว่าง |
| WEB-API-003     | GET one ใช้ URL ที่ถูกต้อง              |
| WEB-API-004     | POST JSON headers/body                  |
| WEB-API-005     | PATCH ส่งเฉพาะ field ที่แก้             |
| WEB-API-006     | DELETE รับ empty 204                    |
| WEB-API-007–009 | แสดง API 400/404/500 message            |
| WEB-API-010     | non-JSON failure fallback               |
| WEB-API-011     | network failure propagation             |

### Frontend components — UI

| ID         | Scenario                                                               |
| ---------- | ---------------------------------------------------------------------- |
| UI-001–005 | form labels, required, limits, date max และ initial values             |
| UI-006     | normalized submission                                                  |
| UI-007–010 | accessible validation errors                                           |
| UI-011     | duplicate-submit lock                                                  |
| UI-012     | server error ไม่ล้าง input                                             |
| UI-013     | cancel ไม่ submit                                                      |
| UI-014     | empty table state                                                      |
| UI-015–020 | table headers, rows, date, row actions และ XSS-safe render             |
| UI-021–025 | delete dialog visibility, identity, cancel, confirm lock และ pending   |
| UI-026–033 | screen load, empty, retry, search, create, edit, delete และ pagination |

### Browser — E2E

| ID      | Scenario                            |
| ------- | ----------------------------------- |
| E2E-001 | empty page ใช้งานได้                |
| E2E-002 | create Thai student end-to-end      |
| E2E-003 | client validation ไม่เรียก API      |
| E2E-004 | edit selected row                   |
| E2E-005 | cancel/confirm delete flow          |
| E2E-006 | Thai search empty result            |
| E2E-007 | ทุก scenario รันบน desktop Chromium |
| E2E-008 | ทุก scenario รันบน iPhone viewport  |

## ลำดับทำให้ test ผ่าน

1. ทำ DTO future-date และ whitespace rules ให้ backend unit validation ผ่าน
2. ทำ StudentsService ให้ service unit tests ผ่าน
3. ทำ HTTP e2e ให้ผ่าน รวม empty PATCH
4. ทำ PrismaStudentsRepository แล้วรัน PostgreSQL integration
5. ทำ StudentsApi ให้ frontend API tests ผ่าน
6. ทำ StudentForm, StudentTable และ DeleteStudentDialog
7. ทำ StudentsScreen orchestration
8. รัน Playwright บน Chromium และ mobile project
9. รัน build/lint/typecheck และ full-stack manual smoke test

## Red/green rule

ในแต่ละรอบให้เลือก test กลุ่มเล็กที่สุด รันให้เห็น failure ที่ตรงเหตุผล เขียน implementation ขั้นต่ำให้ผ่าน แล้ว refactor โดยต้องรักษา test ให้เขียว ห้ามทำหลายโมดูลพร้อมกันจนระบุสาเหตุของ failure ไม่ได้
