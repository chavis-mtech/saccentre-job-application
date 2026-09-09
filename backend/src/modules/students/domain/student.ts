export interface Student {
  birthDate: string;
  createdAt: string;
  firstName: string;
  id: string;
  lastName: string;
  nickname: string;
  updatedAt: string;
}

export interface StudentRecord {
  birthDate: Date;
  createdAt: Date;
  firstName: string;
  id: string;
  lastName: string;
  nickname: string;
  updatedAt: Date;
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
