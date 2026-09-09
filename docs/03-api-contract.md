# REST API Contract

Base URL: `/api/v1`

Content type: `application/json`

## Student

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "firstName": "สมชาย",
  "lastName": "ใจดี",
  "nickname": "ชาย",
  "birthDate": "2005-05-20",
  "createdAt": "2026-09-10T01:00:00.000Z",
  "updatedAt": "2026-09-10T01:00:00.000Z"
}
```

## List students

`GET /students`

Query parameters:

| Parameter | Default     | Allowed                              |
| --------- | ----------- | ------------------------------------ |
| `page`    | `1`         | integer >= 1                         |
| `limit`   | `20`        | integer 1–100                        |
| `search`  | none        | string <= 100                        |
| `sort`    | `createdAt` | `createdAt`, `firstName`, `lastName` |
| `order`   | `desc`      | `asc`, `desc`                        |

Response `200`:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

## Get student

`GET /students/{id}`

- `200`: Student
- `400`: malformed UUID
- `404`: student not found

## Create student

`POST /students`

```json
{
  "firstName": "สมชาย",
  "lastName": "ใจดี",
  "nickname": "ชาย",
  "birthDate": "2005-05-20"
}
```

- `201`: created Student
- `400`: validation failure or unknown property

## Update student

`PATCH /students/{id}`

ส่งอย่างน้อยหนึ่ง field จาก create body:

```json
{
  "nickname": "ใหม่"
}
```

- `200`: updated Student
- `400`: malformed UUID, empty body, invalid field หรือ unknown property
- `404`: student not found

## Delete student

`DELETE /students/{id}`

- `204`: ไม่มี body
- `400`: malformed UUID
- `404`: student not found

## Error shape

NestJS standard error response เป็น baseline:

```json
{
  "statusCode": 400,
  "message": ["firstName should not be empty"],
  "error": "Bad Request"
}
```

Frontend ต้องรองรับ `message` ที่เป็น string หรือ string array และต้องมี fallback สำหรับ response ที่ไม่ใช่ JSON
