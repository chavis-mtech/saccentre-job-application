# Architecture

## System context

```text
Browser
  │ HTTPS / JSON
  ▼
Next.js App Router
  │ REST / JSON
  ▼
NestJS /api/v1
  │ StudentsRepository
  ▼
Prisma ORM + PostgreSQL
```

Next.js รับผิดชอบ presentation, interaction state และเรียก REST API ส่วน NestJS เป็นเจ้าของ validation, business rules และ data access PostgreSQL เป็นแหล่งข้อมูลจริงเพียงแห่งเดียว

## Backend boundaries

```text
StudentsController
  → StudentsService
    → StudentsRepository interface
      → PrismaStudentsRepository
        → PrismaService
          → PostgreSQL
```

- Controller แปลง HTTP input และ status code เท่านั้น
- Service ทำ normalization, not-found behavior, mapping และ pagination metadata
- Repository ทำ Prisma query เท่านั้น ห้ามโยน Prisma-specific type ไปถึง controller
- DTO ทำ request shape validation; service ยังคงต้องรักษา business invariants
- Public response ใช้ date-only string สำหรับ `birthDate` และ UTC ISO string สำหรับ timestamps

## Frontend boundaries

```text
app/students/page.tsx
  → StudentsScreen
    ├─ StudentsApi
    ├─ StudentTable
    ├─ StudentForm
    └─ DeleteStudentDialog
```

- Page เป็น App Router entrypoint และไม่เก็บ business state
- StudentsScreen ประสาน loading, search, pagination และ mutations
- StudentsApi เป็นจุดเดียวที่รู้ base URL, HTTP method และ error parsing
- Presentational components รับข้อมูลและ callback ผ่าน props
- Interactive subtree เป็น Client Components; page ยังคงเป็น Server Component แบบ synchronous

## Data decisions

- PostgreSQL column `birth_date` ใช้ชนิด `DATE`
- ID ใช้ PostgreSQL UUID ผ่าน Prisma `@default(uuid())`
- timestamp ใช้ `TIMESTAMPTZ(3)`
- มี index สำหรับ `last_name + first_name` และ `nickname`
- ไม่กำหนด unique constraint กับข้อมูลชื่อ
- API ไม่คืน Prisma model โดยตรง แต่ map เป็น public contract

## Error behavior

| Condition                           | HTTP                             |
| ----------------------------------- | -------------------------------- |
| malformed UUID                      | 400                              |
| invalid or unknown request property | 400                              |
| future or impossible date           | 400                              |
| empty PATCH                         | 400                              |
| student not found                   | 404                              |
| create success                      | 201                              |
| read/update success                 | 200                              |
| delete success                      | 204                              |
| unexpected failure                  | 500 โดยไม่เปิดเผย stack หรือ SQL |

## Test seams

- StudentsService unit tests ใช้ mock `StudentsRepository`
- HTTP e2e ใช้ in-memory repository เพื่อทดสอบ routing/pipe/status โดยไม่พึ่งฐานข้อมูล
- Prisma integration tests ใช้ PostgreSQL test database จริง
- React component tests inject callback และ spy `StudentsApi`
- Playwright intercept REST API เพื่อทดสอบ browser flow แยกจาก backend
- Full smoke test หลัง implementation ต้องรัน Next.js + NestJS + PostgreSQL ร่วมกันอีกชั้น

## Runtime

- Node.js 24
- API port `3001`
- Web port `3000`
- API prefix `/api/v1`
- Swagger `/api/docs`
- local PostgreSQL ผ่าน `compose.yaml`
