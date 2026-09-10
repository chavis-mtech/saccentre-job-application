import type {
  Student,
  StudentInput,
  StudentPage,
  StudentQuery,
} from "../types";

export class StudentsApi {
  constructor(
    private readonly baseUrl = process.env.NEXT_PUBLIC_API_URL ??
      "http://localhost:3001/api/v1",
    private readonly fetcher: typeof fetch = (...args) => fetch(...args),
  ) {}

  list(query: StudentQuery = {}): Promise<StudentPage> {
    const params = Object.entries(query)
      .filter(
        (entry): entry is [string, string | number] => entry[1] !== undefined,
      )
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
      )
      .join("&");
    const suffix = params ? `?${params}` : "";
    return this.request<StudentPage>(`/students${suffix}`);
  }

  findOne(id: string): Promise<Student> {
    return this.request<Student>(`/students/${encodeURIComponent(id)}`);
  }

  create(input: StudentInput): Promise<Student> {
    return this.request<Student>("/students", {
      body: JSON.stringify(input),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
  }

  createMany(inputs: StudentInput[]): Promise<Student[]> {
    return this.request<Student[]>("/students/bulk", {
      body: JSON.stringify({ students: inputs }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
  }

  update(id: string, input: Partial<StudentInput>): Promise<Student> {
    return this.request<Student>(`/students/${encodeURIComponent(id)}`, {
      body: JSON.stringify(input),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });
  }

  remove(id: string): Promise<void> {
    return this.request<void>(`/students/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await this.fetcher(`${this.baseUrl}${path}`, {
      ...init,
      headers: { Accept: "application/json", ...init.headers },
    });

    if (!response.ok) {
      let message = `Request failed with status ${response.status}`;
      if (response.headers.get("content-type")?.includes("application/json")) {
        const body = (await response.json()) as { message?: string | string[] };
        if (body.message) {
          message = Array.isArray(body.message)
            ? body.message.join(", ")
            : body.message;
        }
      }
      throw new Error(message);
    }

    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }
}
