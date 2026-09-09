"use client";

import type { Student } from "../types";

export interface StudentTableProps {
  onDelete: (student: Student) => void;
  onEdit: (student: Student) => void;
  students: Student[];
}

export function StudentTable(_props: StudentTableProps) {
  void _props;
  return <div>TODO: implement StudentTable</div>;
}
