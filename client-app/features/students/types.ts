export interface Student {
  birthDate: string;
  createdAt: string;
  firstName: string;
  id: string;
  lastName: string;
  nickname: string;
  updatedAt: string;
}

export interface StudentInput {
  birthDate: string;
  firstName: string;
  lastName: string;
  nickname: string;
}

export interface StudentPage {
  data: Student[];
  meta: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
}

export interface StudentQuery {
  limit?: number;
  order?: "asc" | "desc";
  page?: number;
  search?: string;
  sort?: "createdAt" | "firstName" | "lastName";
}
