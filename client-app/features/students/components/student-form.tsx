"use client";

import type { StudentInput } from "../types";

export interface StudentFormProps {
  initialValue?: StudentInput;
  mode: "create" | "edit";
  onCancel?: () => void;
  onSubmit: (input: StudentInput) => Promise<void> | void;
}

export function StudentForm(_props: StudentFormProps) {
  void _props;
  return <div>TODO: implement StudentForm</div>;
}
