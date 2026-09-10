"use client";

import { useState } from "react";
import type { Student } from "../types";

export interface DeleteStudentDialogProps {
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
  open: boolean;
  student: Student | null;
}

export function DeleteStudentDialog(_props: DeleteStudentDialogProps) {
  const { isPending = false, onCancel, onConfirm, open, student } = _props;
  const [isConfirming, setIsConfirming] = useState(false);
  const pending = isPending || isConfirming;

  if (!open || !student) return null;

  async function handleConfirm() {
    if (pending) return;
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4">
      <section
        aria-labelledby="delete-dialog-title"
        aria-modal="true"
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
        role="alertdialog"
      >
        <h2
          className="text-lg font-bold text-slate-950"
          id="delete-dialog-title"
        >
          ยืนยันการลบ
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          คุณต้องการลบข้อมูลของ{" "}
          <strong className="text-slate-900">
            {student.firstName} {student.lastName}
          </strong>{" "}
          ใช่หรือไม่ การทำรายการนี้ไม่สามารถย้อนกลับได้
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            disabled={pending}
            onClick={onCancel}
            type="button"
          >
            ยกเลิก
          </button>
          <button
            className="h-10 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
            disabled={pending}
            onClick={handleConfirm}
            type="button"
          >
            {pending ? "กำลังลบ" : "ยืนยันการลบ"}
          </button>
        </div>
      </section>
    </div>
  );
}
