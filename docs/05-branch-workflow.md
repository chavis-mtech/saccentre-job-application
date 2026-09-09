# Branch and TDD Workflow

## Branches

```text
main
└── test/student-crud-contract
    ├── feature/student-validation
    ├── feature/student-service
    ├── feature/student-prisma-repository
    ├── feature/student-api
    ├── feature/student-ui-components
    └── feature/student-screen
```

`test/student-crud-contract` เก็บ docs, contracts, stubs และ RED tests หลัง review แล้วให้สร้าง feature branch จาก branch นี้ทีละงาน เมื่อ test กลุ่มนั้นผ่านจึง merge กลับ และรัน regression suite

## Per-feature flow

```text
เลือก test IDs
→ ยืนยันว่า fail ด้วยเหตุผลที่คาด
→ เขียน implementation ขั้นต่ำ
→ รัน test เฉพาะไฟล์
→ refactor
→ typecheck + lint + related tests
→ commit แบบ scope เดียว
→ merge เข้า test/student-crud-contract
```

## Suggested commits

ใช้ subject สั้นและไม่มี commit body:

```text
test: define student CRUD contracts
feat(api): validate student input
feat(api): implement student service
feat(api): implement student repository
feat(web): implement students API client
feat(web): implement student form and table
feat(web): implement student CRUD screen
```

## Merge gate

- staged diff ไม่มี secret
- test ที่อยู่ใน scope ผ่าน
- test เดิมที่เคยผ่านยังผ่าน
- typecheck และ lint ผ่าน
- migration และ Prisma schema ตรงกัน
- ไม่มี `.only`, accidental `.skip` หรือ snapshot ที่ยอมรับโดยไม่ตรวจ
- commit ไม่มี generated coverage, build output หรือ Playwright report

## Release gate

เมื่อทุก test เขียว ให้ merge contract branch เข้า `main`, สร้าง test database ใหม่จาก migration, รัน full suite อีกครั้ง และ deploy commit เดียวกับที่ทดสอบ ห้ามแก้ไฟล์บน production โดยตรง
