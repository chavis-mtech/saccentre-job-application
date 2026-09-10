"use client";

import { useState, type FormEvent } from "react";
import type { StudentInput } from "../types";

const EMPTY_STUDENT: StudentInput = {
  birthDate: "",
  firstName: "",
  lastName: "",
  nickname: "",
};

export interface BulkStudentFormProps {
  onCancel: () => void;
  onSubmit: (inputs: StudentInput[]) => Promise<void> | void;
}

export function BulkStudentForm({ onCancel, onSubmit }: BulkStudentFormProps) {
  const [rows, setRows] = useState<StudentInput[]>([{ ...EMPTY_STUDENT }]);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const maxBirthDate = new Date().toISOString().slice(0, 10);

  function updateRow(index: number, field: keyof StudentInput, value: string) {
    setRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      ),
    );
  }

  function addRow() {
    if (rows.length < 50)
      setRows((current) => [...current, { ...EMPTY_STUDENT }]);
  }

  function removeRow(index: number) {
    if (rows.length > 1) {
      setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    const normalized = rows.map((row) => ({
      ...row,
      firstName: row.firstName.trim(),
      lastName: row.lastName.trim(),
      nickname: row.nickname.trim(),
    }));
    const invalidRow = normalized.findIndex(
      (row) =>
        !row.firstName ||
        !row.lastName ||
        !row.nickname ||
        !row.birthDate ||
        row.birthDate > maxBirthDate,
    );

    if (invalidRow >= 0) {
      setError(`กรุณาตรวจสอบข้อมูลแถวที่ ${invalidRow + 1}`);
      return;
    }

    setError("");
    setIsPending(true);
    try {
      await onSubmit(normalized);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "บันทึกข้อมูลไม่สำเร็จ",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="space-y-4" noValidate onSubmit={handleSubmit}>
      {error && (
        <div
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="hidden grid-cols-[2rem_minmax(0,1fr)_minmax(0,1fr)_minmax(0,.8fr)_minmax(11rem,1fr)_2rem] gap-2 px-3 text-xs font-medium text-slate-500 sm:grid">
        <span>#</span>
        <span>ชื่อ</span>
        <span>นามสกุล</span>
        <span>ชื่อเล่น</span>
        <span>วันเกิด</span>
        <span />
      </div>

      <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
        {rows.map((row, index) => (
          <fieldset
            className="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-[2rem_minmax(0,1fr)_minmax(0,1fr)_minmax(0,.8fr)_minmax(11rem,1fr)_2rem] sm:items-end sm:gap-2"
            key={index}
          >
            <legend className="sr-only">แถวที่ {index + 1}</legend>
            <span className="hidden h-10 items-center text-sm text-slate-400 sm:flex">
              {index + 1}
            </span>
            <StudentInput
              label="ชื่อ"
              maxLength={100}
              onChange={(value) => updateRow(index, "firstName", value)}
              placeholder="ชื่อ"
              value={row.firstName}
            />
            <StudentInput
              label="นามสกุล"
              maxLength={100}
              onChange={(value) => updateRow(index, "lastName", value)}
              placeholder="นามสกุล"
              value={row.lastName}
            />
            <StudentInput
              label="ชื่อเล่น"
              maxLength={50}
              onChange={(value) => updateRow(index, "nickname", value)}
              placeholder="ชื่อเล่น"
              value={row.nickname}
            />
            <StudentInput
              label="วันเกิด"
              max={maxBirthDate}
              onChange={(value) => updateRow(index, "birthDate", value)}
              type="date"
              value={row.birthDate}
            />
            <button
              aria-label={`ลบแถวที่ ${index + 1}`}
              className="h-8 text-left text-xs text-rose-600 hover:text-rose-800 disabled:invisible sm:text-center sm:text-lg"
              disabled={rows.length === 1}
              onClick={() => removeRow(index)}
              type="button"
            >
              <span className="sm:hidden">ลบแถว</span>
              <span aria-hidden="true" className="hidden sm:inline">
                ×
              </span>
            </button>
          </fieldset>
        ))}
      </div>

      <button
        className="text-sm font-medium text-slate-600 hover:text-slate-950 disabled:opacity-40"
        disabled={rows.length >= 50 || isPending}
        onClick={addRow}
        type="button"
      >
        + เพิ่มแถว
      </button>

      <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
        <button
          className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          disabled={isPending}
          onClick={onCancel}
          type="button"
        >
          ยกเลิก
        </button>
        <button
          className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "กำลังบันทึก" : "บันทึกข้อมูล"}
        </button>
      </div>
    </form>
  );
}

function StudentInput({
  label,
  max,
  maxLength,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  label: string;
  max?: string;
  maxLength?: number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "date" | "text";
  value: string;
}) {
  return (
    <label className="grid min-w-0 gap-1.5 text-sm font-medium text-slate-700">
      <span className="text-xs sm:sr-only">{label}</span>
      <input
        aria-label={label}
        className="h-10 min-w-0 max-w-full rounded-lg border border-slate-300 px-3 text-sm font-normal outline-none placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
        max={max}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required
        type={type}
        value={value}
      />
    </label>
  );
}
