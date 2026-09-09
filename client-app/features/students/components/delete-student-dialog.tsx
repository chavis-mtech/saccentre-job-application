"use client";

import type { Student } from "../types";

export interface DeleteStudentDialogProps {
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
  open: boolean;
  student: Student | null;
}

export function DeleteStudentDialog(_props: DeleteStudentDialogProps) {
  void _props;
  return <div>TODO: implement DeleteStudentDialog</div>;
}
