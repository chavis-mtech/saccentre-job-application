import { expect, type Page, test } from "@playwright/test";

interface Student {
  birthDate: string;
  createdAt: string;
  firstName: string;
  id: string;
  lastName: string;
  nickname: string;
  updatedAt: string;
}

async function mockStudentsApi(page: Page, initial: Student[] = []) {
  const students = [...initial];

  await page.route("**/api/v1/students**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const id = url.pathname.match(/\/students\/([^/]+)$/)?.[1];

    if (request.method() === "GET" && !id) {
      const search = url.searchParams.get("search")?.toLocaleLowerCase("th");
      const data = search
        ? students.filter((student) =>
            [student.firstName, student.lastName, student.nickname].some(
              (value) => value.toLocaleLowerCase("th").includes(search),
            ),
          )
        : students;
      await route.fulfill({
        json: {
          data,
          meta: {
            limit: 20,
            page: 1,
            total: data.length,
            totalPages: data.length ? 1 : 0,
          },
        },
      });
      return;
    }

    if (request.method() === "POST") {
      const input = request.postDataJSON();
      const now = new Date().toISOString();
      const student: Student = {
        ...input,
        createdAt: now,
        id: "33333333-3333-4333-8333-333333333333",
        updatedAt: now,
      };
      students.push(student);
      await route.fulfill({ json: student, status: 201 });
      return;
    }

    const index = students.findIndex((student) => student.id === id);
    if (index === -1) {
      await route.fulfill({
        json: { message: "Student not found" },
        status: 404,
      });
      return;
    }

    if (request.method() === "PATCH") {
      students[index] = {
        ...students[index],
        ...request.postDataJSON(),
        updatedAt: new Date().toISOString(),
      };
      await route.fulfill({ json: students[index] });
      return;
    }

    if (request.method() === "DELETE") {
      students.splice(index, 1);
      await route.fulfill({ body: "", status: 204 });
      return;
    }

    await route.fallback();
  });

  return students;
}

const existingStudent: Student = {
  birthDate: "2005-05-20",
  createdAt: "2026-09-10T01:00:00.000Z",
  firstName: "สมชาย",
  id: "11111111-1111-4111-8111-111111111111",
  lastName: "ใจดี",
  nickname: "ชาย",
  updatedAt: "2026-09-10T01:00:00.000Z",
};

test("shows a usable empty student page", async ({ page }) => {
  await mockStudentsApi(page);
  await page.goto("/students");

  await expect(
    page.getByRole("heading", { name: "ข้อมูลนักเรียน" }),
  ).toBeVisible();
  await expect(page.getByText("ยังไม่มีข้อมูลนักเรียน")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "เพิ่มนักเรียน" }),
  ).toBeVisible();
});

test("creates and displays a Thai student", async ({ page }) => {
  await mockStudentsApi(page);
  await page.goto("/students");

  await page.getByRole("button", { name: "เพิ่มนักเรียน" }).click();
  await page.getByLabel("ชื่อ", { exact: true }).fill("สมชาย");
  await page.getByLabel("นามสกุล").fill("ใจดี");
  await page.getByLabel("ชื่อเล่น").fill("ชาย");
  await page.getByLabel("วันเกิด").fill("2005-05-20");
  await page.getByRole("button", { name: "บันทึกข้อมูล" }).click();

  await expect(page.getByText("เพิ่มข้อมูลสำเร็จ")).toBeVisible();
  await expect(page.getByRole("row", { name: /สมชาย ใจดี ชาย/ })).toBeVisible();
});

test("validates whitespace and future dates before calling the API", async ({
  page,
}) => {
  const students = await mockStudentsApi(page);
  await page.goto("/students");
  await page.getByRole("button", { name: "เพิ่มนักเรียน" }).click();

  await page.getByLabel("ชื่อ", { exact: true }).fill("   ");
  await page.getByLabel("นามสกุล").fill("ใจดี");
  await page.getByLabel("ชื่อเล่น").fill("ชาย");
  await page.getByLabel("วันเกิด").fill("2999-01-01");
  await page.getByRole("button", { name: "บันทึกข้อมูล" }).click();

  await expect(page.getByRole("alert")).toBeVisible();
  expect(students).toHaveLength(0);
});

test("edits only the selected student", async ({ page }) => {
  await mockStudentsApi(page, [existingStudent]);
  await page.goto("/students");

  await page.getByRole("button", { name: "แก้ไข สมชาย ใจดี" }).click();
  await page.getByLabel("ชื่อเล่น").fill("ใหม่");
  await page.getByRole("button", { name: "บันทึกการแก้ไข" }).click();

  await expect(page.getByText("แก้ไขข้อมูลสำเร็จ")).toBeVisible();
  await expect(
    page.getByRole("row", { name: /สมชาย ใจดี ใหม่/ }),
  ).toBeVisible();
});

test("does not delete until the user confirms", async ({ page }) => {
  await mockStudentsApi(page, [existingStudent]);
  await page.goto("/students");

  await page.getByRole("button", { name: "ลบ สมชาย ใจดี" }).click();
  await expect(
    page.getByRole("alertdialog", { name: "ยืนยันการลบ" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "ยกเลิก" }).click();
  await expect(page.getByText("สมชาย")).toBeVisible();

  await page.getByRole("button", { name: "ลบ สมชาย ใจดี" }).click();
  await page.getByRole("button", { name: "ยืนยันการลบ" }).click();
  await expect(page.getByText("ลบข้อมูลสำเร็จ")).toBeVisible();
  await expect(page.getByText("ยังไม่มีข้อมูลนักเรียน")).toBeVisible();
});

test("searches Thai names and preserves an actionable empty result", async ({
  page,
}) => {
  await mockStudentsApi(page, [existingStudent]);
  await page.goto("/students");

  await page.getByRole("searchbox", { name: "ค้นหานักเรียน" }).fill("ไม่พบ");
  await page.getByRole("button", { name: "ค้นหา" }).click();

  await expect(page.getByText("ไม่พบข้อมูลที่ค้นหา")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "ล้างการค้นหา" }),
  ).toBeVisible();
});
