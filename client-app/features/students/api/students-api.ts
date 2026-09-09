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
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  list(_query: StudentQuery = {}): Promise<StudentPage> {
    void _query;
    throw new Error("TODO: implement StudentsApi.list");
  }

  findOne(_id: string): Promise<Student> {
    void _id;
    throw new Error("TODO: implement StudentsApi.findOne");
  }

  create(_input: StudentInput): Promise<Student> {
    void _input;
    throw new Error("TODO: implement StudentsApi.create");
  }

  update(_id: string, _input: Partial<StudentInput>): Promise<Student> {
    void _id;
    void _input;
    throw new Error("TODO: implement StudentsApi.update");
  }

  remove(_id: string): Promise<void> {
    void _id;
    throw new Error("TODO: implement StudentsApi.remove");
  }
}
