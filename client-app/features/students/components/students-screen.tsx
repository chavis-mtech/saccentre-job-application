"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { StudentsApi } from "../api/students-api";
import type { Student, StudentInput, StudentPage } from "../types";
import { BulkStudentForm } from "./bulk-student-form";
import { DeleteStudentDialog } from "./delete-student-dialog";
import { StudentForm } from "./student-form";
import { StudentTable } from "./student-table";

const EMPTY_PAGE: StudentPage = {
  data: [],
  meta: { limit: 20, page: 1, total: 0, totalPages: 0 },
};

export function StudentsScreen() {
  const api = useMemo(() => new StudentsApi(), []);
  const [result, setResult] = useState<StudentPage>(EMPTY_PAGE);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [editor, setEditor] = useState<"create" | "edit" | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const nextResult = await api.list({
        page,
        ...(activeSearch ? { search: activeSearch } : {}),
      });
      setResult(nextResult);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "โหลดข้อมูลไม่สำเร็จ",
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeSearch, api, page]);

  useEffect(() => {
    const task = window.setTimeout(() => void loadStudents(), 0);
    return () => window.clearTimeout(task);
  }, [loadStudents]);

  function openCreate() {
    setSelectedStudent(null);
    setEditor("create");
    setNotice("");
  }

  function openEdit(student: Student) {
    setSelectedStudent(student);
    setEditor("edit");
    setNotice("");
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setActiveSearch(search.trim());
  }

  function clearSearch() {
    setSearch("");
    setPage(1);
    setActiveSearch("");
  }

  async function createStudents(inputs: StudentInput[]) {
    await api.createMany(inputs);
    setEditor(null);
    await loadStudents();
    setNotice(`เพิ่มข้อมูลสำเร็จ ${inputs.length} รายการ`);
  }

  async function updateStudent(input: StudentInput) {
    if (!selectedStudent) return;
    await api.update(selectedStudent.id, input);
    setEditor(null);
    setSelectedStudent(null);
    await loadStudents();
    setNotice("แก้ไขข้อมูลสำเร็จ");
  }

  async function deleteStudent() {
    if (!studentToDelete) return;
    await api.remove(studentToDelete.id);
    setStudentToDelete(null);
    await loadStudents();
    setNotice("ลบข้อมูลสำเร็จ");
  }

  const editorValue = selectedStudent
    ? {
        birthDate: selectedStudent.birthDate,
        firstName: selectedStudent.firstName,
        lastName: selectedStudent.lastName,
        nickname: selectedStudent.nickname,
      }
    : undefined;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <span className="text-sm font-bold tracking-tight">SAC Centre</span>
          <span className="ml-3 border-l border-slate-200 pl-3 text-xs text-slate-500">
            Student Management
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              จัดการนักเรียน
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              นักเรียนทั้งหมด {result.meta.total} คน
            </p>
          </div>
          <button
            aria-label="เพิ่มนักเรียน"
            className="h-10 shrink-0 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700"
            onClick={openCreate}
            type="button"
          >
            + เพิ่มนักเรียน
          </button>
        </div>

        {notice && (
          <div
            className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            role="status"
          >
            {notice}
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-semibold">รายชื่อนักเรียน</h2>
            <form
              className="flex w-full gap-2 sm:max-w-sm"
              onSubmit={submitSearch}
              role="search"
            >
              <label className="min-w-0 flex-1">
                <span className="sr-only">ค้นหานักเรียน</span>
                <input
                  aria-label="ค้นหานักเรียน"
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="ค้นหาชื่อหรือชื่อเล่น"
                  type="search"
                  value={search}
                />
              </label>
              <button
                className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                type="submit"
              >
                ค้นหา
              </button>
            </form>
          </div>

          {isLoading ? (
            <div
              className="flex min-h-64 items-center justify-center text-sm text-slate-500"
              role="status"
            >
              กำลังโหลดข้อมูล
            </div>
          ) : loadError ? (
            <div
              className="flex min-h-64 flex-col items-center justify-center px-6 text-center"
              role="alert"
            >
              <p className="text-sm text-rose-700">{loadError}</p>
              <button
                className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
                onClick={() => void loadStudents()}
                type="button"
              >
                ลองอีกครั้ง
              </button>
            </div>
          ) : activeSearch && result.data.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <p className="font-medium">ไม่พบข้อมูลที่ค้นหา</p>
              <button
                className="mt-3 text-sm text-slate-500 underline underline-offset-4"
                onClick={clearSearch}
                type="button"
              >
                ล้างการค้นหา
              </button>
            </div>
          ) : (
            <StudentTable
              students={result.data}
              onDelete={setStudentToDelete}
              onEdit={openEdit}
            />
          )}

          {!isLoading && !loadError && result.meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
              <p className="text-xs text-slate-500">
                หน้า {page} จาก {result.meta.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  aria-label="หน้าก่อนหน้า"
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40"
                  disabled={page <= 1}
                  onClick={() => setPage((value) => value - 1)}
                  type="button"
                >
                  ก่อนหน้า
                </button>
                <button
                  aria-label="หน้าถัดไป"
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40"
                  disabled={page >= result.meta.totalPages}
                  onClick={() => setPage((value) => value + 1)}
                  type="button"
                >
                  ถัดไป
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {editor && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/30 p-3 sm:p-6">
          <aside
            aria-label={editor === "create" ? "เพิ่มนักเรียน" : "แก้ไขนักเรียน"}
            className={`max-h-full w-full overflow-y-auto rounded-xl bg-white p-5 shadow-xl sm:p-6 ${editor === "create" ? "max-w-5xl" : "max-w-lg"}`}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  {editor === "create"
                    ? "เพิ่มนักเรียน"
                    : "แก้ไขข้อมูลนักเรียน"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  กรอกข้อมูลให้ครบก่อนบันทึก
                </p>
              </div>
              <button
                aria-label="ปิด"
                className="grid size-9 shrink-0 place-items-center rounded-md text-xl text-slate-500 hover:bg-slate-100"
                onClick={() => setEditor(null)}
                type="button"
              >
                ×
              </button>
            </div>
            {editor === "create" ? (
              <BulkStudentForm
                onCancel={() => setEditor(null)}
                onSubmit={createStudents}
              />
            ) : (
              <StudentForm
                initialValue={editorValue}
                mode="edit"
                onCancel={() => setEditor(null)}
                onSubmit={updateStudent}
              />
            )}
          </aside>
        </div>
      )}

      <DeleteStudentDialog
        open={Boolean(studentToDelete)}
        student={studentToDelete}
        onCancel={() => setStudentToDelete(null)}
        onConfirm={deleteStudent}
      />
    </main>
  );
}
