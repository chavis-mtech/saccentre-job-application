"use client";

import { useState, type FormEvent } from "react";
import type { StudentInput } from "../types";

export interface StudentFormProps {
  initialValue?: StudentInput;
  mode: "create" | "edit";
  onCancel?: () => void;
  onSubmit: (input: StudentInput) => Promise<void> | void;
}

export function StudentForm(_props: StudentFormProps) {
  const { initialValue, mode, onCancel, onSubmit } = _props;
  const [values, setValues] = useState<StudentInput>(
    initialValue ?? {
      birthDate: "",
      firstName: "",
      lastName: "",
      nickname: "",
    },
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [isPending, setIsPending] = useState(false);
  const maxBirthDate = new Date().toISOString().slice(0, 10);

  function updateField(field: keyof StudentInput, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    const normalized = {
      birthDate: values.birthDate,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      nickname: values.nickname.trim(),
    };
    const nextErrors: string[] = [];

    if (!normalized.firstName) nextErrors.push("กรุณากรอกชื่อ");
    if (!normalized.lastName) nextErrors.push("กรุณากรอกนามสกุล");
    if (!normalized.nickname) nextErrors.push("กรุณากรอกชื่อเล่น");
    if (!normalized.birthDate) nextErrors.push("กรุณาเลือกวันเกิด");
    if (normalized.birthDate > maxBirthDate) {
      nextErrors.push("วันเกิดต้องไม่เกินวันปัจจุบัน");
    }

    if (nextErrors.length) {
      setErrors(nextErrors);
      return;
    }

    setErrors([]);
    setIsPending(true);
    try {
      await onSubmit(normalized);
    } catch (error) {
      setErrors([
        error instanceof Error ? error.message : "ไม่สามารถบันทึกข้อมูลได้",
      ]);
    } finally {
      setIsPending(false);
    }
  }

  const fields: Array<{
    autoComplete: string;
    key: keyof StudentInput;
    label: string;
    maxLength?: number;
    placeholder: string;
    type?: string;
  }> = [
    {
      autoComplete: "given-name",
      key: "firstName",
      label: "ชื่อ",
      maxLength: 100,
      placeholder: "กรอกชื่อจริง",
    },
    {
      autoComplete: "family-name",
      key: "lastName",
      label: "นามสกุล",
      maxLength: 100,
      placeholder: "กรอกนามสกุล",
    },
    {
      autoComplete: "off",
      key: "nickname",
      label: "ชื่อเล่น",
      maxLength: 50,
      placeholder: "กรอกชื่อเล่น",
    },
    {
      autoComplete: "bday",
      key: "birthDate",
      label: "วันเกิด",
      placeholder: "",
      type: "date",
    },
  ];

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit}>
      {errors.length > 0 && (
        <div
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          role="alert"
        >
          {errors.join(" · ")}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const inputId = `student-${field.key}`;

          return (
            <div className="grid gap-2" key={field.key}>
              <label
                className="text-sm font-semibold text-slate-700"
                htmlFor={inputId}
              >
                {field.label}
                <span className="ml-1 text-rose-500" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                aria-label={field.label}
                autoComplete={field.autoComplete}
                className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                id={inputId}
                max={field.key === "birthDate" ? maxBirthDate : undefined}
                maxLength={field.maxLength}
                onChange={(event) => updateField(field.key, event.target.value)}
                placeholder={field.placeholder}
                required
                type={field.type ?? "text"}
                value={values[field.key]}
              />
            </div>
          );
        })}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            disabled={isPending}
            onClick={onCancel}
            type="button"
          >
            ยกเลิก
          </button>
        )}
        <button
          className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          {isPending
            ? "กำลังบันทึก"
            : mode === "create"
              ? "บันทึกข้อมูล"
              : "บันทึกการแก้ไข"}
        </button>
      </div>
    </form>
  );
}
