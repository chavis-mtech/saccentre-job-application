"use client";

import type { Student } from "../types";

export interface StudentTableProps {
  onDelete: (student: Student) => void;
  onEdit: (student: Student) => void;
  students: Student[];
}

export function StudentTable(_props: StudentTableProps) {
  const { onDelete, onEdit, students } = _props;

  if (students.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
        <p className="font-medium text-slate-700">ยังไม่มีข้อมูลนักเรียน</p>
        <p className="mt-1 text-sm text-slate-500">
          เพิ่มนักเรียนเพื่อเริ่มต้น
        </p>
      </div>
    );
  }

  function formatDate(value: string) {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-3xl border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr className="text-xs font-semibold text-slate-500">
            {["ชื่อ", "นามสกุล", "ชื่อเล่น", "วันเกิด", "จัดการ"].map(
              (heading) => (
                <th
                  className="border-b border-slate-200 bg-slate-50 px-5 py-3"
                  key={heading}
                  scope="col"
                >
                  {heading}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr className="transition hover:bg-slate-50" key={student.id}>
              <td className="border-b border-slate-100 px-5 py-4 font-medium text-slate-900">
                {student.firstName}
              </td>
              <td className="border-b border-slate-100 px-5 py-4 text-slate-600">
                {student.lastName}
              </td>
              <td className="border-b border-slate-100 px-5 py-4 text-slate-600">
                {student.nickname}
              </td>
              <td className="border-b border-slate-100 px-5 py-4 text-slate-600">
                {formatDate(student.birthDate)}
              </td>
              <td className="border-b border-slate-100 px-5 py-4">
                <div className="flex gap-2">
                  <button
                    aria-label={`แก้ไข ${student.firstName} ${student.lastName}`}
                    className="rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    onClick={() => onEdit(student)}
                    type="button"
                  >
                    แก้ไข
                  </button>
                  <button
                    aria-label={`ลบ ${student.firstName} ${student.lastName}`}
                    className="rounded-md px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                    onClick={() => onDelete(student)}
                    type="button"
                  >
                    ลบ
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
