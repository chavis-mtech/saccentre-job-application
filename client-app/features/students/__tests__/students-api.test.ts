import { describe, expect, it, vi } from "vitest";
import { StudentsApi } from "../api/students-api";
import { student, STUDENT_ID } from "./fixtures";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status,
  });
}

describe("StudentsApi", () => {
  const baseUrl = "https://example.test/api/v1";

  it("lists students with no dangling query separator", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      jsonResponse({
        data: [student()],
        meta: { limit: 20, page: 1, total: 1, totalPages: 1 },
      }),
    );

    await new StudentsApi(baseUrl, fetcher).list();

    expect(fetcher).toHaveBeenCalledWith(`${baseUrl}/students`, {
      headers: { Accept: "application/json" },
    });
  });

  it("encodes list filters as query parameters", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      jsonResponse({
        data: [],
        meta: { limit: 10, page: 2, total: 0, totalPages: 0 },
      }),
    );

    await new StudentsApi(baseUrl, fetcher).list({
      limit: 10,
      order: "asc",
      page: 2,
      search: "สม ชาย",
      sort: "firstName",
    });

    expect(fetcher).toHaveBeenCalledWith(
      `${baseUrl}/students?limit=10&order=asc&page=2&search=${encodeURIComponent("สม ชาย")}&sort=firstName`,
      { headers: { Accept: "application/json" } },
    );
  });

  it("gets one student using an encoded id", async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse(student()));

    await expect(
      new StudentsApi(baseUrl, fetcher).findOne(STUDENT_ID),
    ).resolves.toEqual(student());
    expect(fetcher).toHaveBeenCalledWith(`${baseUrl}/students/${STUDENT_ID}`, {
      headers: { Accept: "application/json" },
    });
  });

  it("creates a student as JSON", async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse(student(), 201));
    const input = {
      birthDate: "2005-05-20",
      firstName: "สมชาย",
      lastName: "ใจดี",
      nickname: "ชาย",
    };

    await expect(
      new StudentsApi(baseUrl, fetcher).create(input),
    ).resolves.toEqual(student());
    expect(fetcher).toHaveBeenCalledWith(`${baseUrl}/students`, {
      body: JSON.stringify(input),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
    });
  });

  it("creates multiple students in one request", async () => {
    const input = {
      birthDate: "2005-05-20",
      firstName: "สมชาย",
      lastName: "ใจดี",
      nickname: "ชาย",
    };
    const fetcher = vi.fn().mockResolvedValue(jsonResponse([student()], 201));

    await new StudentsApi(baseUrl, fetcher).createMany([input]);

    expect(fetcher).toHaveBeenCalledWith(`${baseUrl}/students/bulk`, {
      body: JSON.stringify({ students: [input] }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
    });
  });

  it("patches only supplied student fields", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(jsonResponse(student({ nickname: "ใหม่" })));

    await new StudentsApi(baseUrl, fetcher).update(STUDENT_ID, {
      nickname: "ใหม่",
    });

    expect(fetcher).toHaveBeenCalledWith(`${baseUrl}/students/${STUDENT_ID}`, {
      body: JSON.stringify({ nickname: "ใหม่" }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "PATCH",
    });
  });

  it("deletes a student and accepts an empty 204 response", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 204 }));

    await expect(
      new StudentsApi(baseUrl, fetcher).remove(STUDENT_ID),
    ).resolves.toBeUndefined();
    expect(fetcher).toHaveBeenCalledWith(`${baseUrl}/students/${STUDENT_ID}`, {
      headers: { Accept: "application/json" },
      method: "DELETE",
    });
  });

  it.each([
    [400, "Bad Request"],
    [404, "Student not found"],
    [500, "Internal server error"],
  ])("surfaces API error %s with its message", async (status, message) => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(jsonResponse({ message }, status));

    await expect(
      new StudentsApi(baseUrl, fetcher).findOne(STUDENT_ID),
    ).rejects.toThrow(message);
  });

  it("returns a stable error when a non-JSON failure is received", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response("gateway down", { status: 502 }));

    await expect(new StudentsApi(baseUrl, fetcher).list()).rejects.toThrow(
      "Request failed with status 502",
    );
  });

  it("propagates network failures", async () => {
    const fetcher = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(new StudentsApi(baseUrl, fetcher).list()).rejects.toThrow(
      "Failed to fetch",
    );
  });
});
