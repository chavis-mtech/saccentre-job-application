import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StudentTable } from "../components/student-table";
import { student } from "./fixtures";

describe("StudentTable", () => {
  it("shows an empty state without an empty table", () => {
    render(<StudentTable students={[]} onDelete={vi.fn()} onEdit={vi.fn()} />);

    expect(screen.getByText("ยังไม่มีข้อมูลนักเรียน")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders accessible column headings", () => {
    render(
      <StudentTable
        students={[student()]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    for (const heading of [
      "ชื่อ",
      "นามสกุล",
      "ชื่อเล่น",
      "วันเกิด",
      "จัดการ",
    ]) {
      expect(
        screen.getByRole("columnheader", { name: heading }),
      ).toBeInTheDocument();
    }
  });

  it("renders every student in a separate row", () => {
    render(
      <StudentTable
        students={[
          student(),
          student({
            id: "22222222-2222-4222-8222-222222222222",
            firstName: "สุดา",
          }),
        ]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.getByText("สมชาย")).toBeInTheDocument();
    expect(screen.getByText("สุดา")).toBeInTheDocument();
  });

  it("formats a date-only value without timezone drift", () => {
    render(
      <StudentTable
        students={[student({ birthDate: "2005-05-20" })]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    expect(screen.getByText("20/05/2005")).toBeInTheDocument();
  });

  it("binds edit to the student in the selected row", async () => {
    const user = userEvent.setup();
    const selected = student();
    const onEdit = vi.fn();
    render(
      <StudentTable students={[selected]} onDelete={vi.fn()} onEdit={onEdit} />,
    );

    const row = screen.getByRole("row", { name: /สมชาย/ });
    await user.click(
      within(row).getByRole("button", { name: "แก้ไข สมชาย ใจดี" }),
    );

    expect(onEdit).toHaveBeenCalledWith(selected);
  });

  it("binds delete to the student in the selected row", async () => {
    const user = userEvent.setup();
    const selected = student();
    const onDelete = vi.fn();
    render(
      <StudentTable
        students={[selected]}
        onDelete={onDelete}
        onEdit={vi.fn()}
      />,
    );

    const row = screen.getByRole("row", { name: /สมชาย/ });
    await user.click(
      within(row).getByRole("button", { name: "ลบ สมชาย ใจดี" }),
    );

    expect(onDelete).toHaveBeenCalledWith(selected);
  });

  it("renders hostile input as text rather than HTML", () => {
    const { container } = render(
      <StudentTable
        students={[student({ firstName: "<script>alert(1)</script>" })]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    expect(screen.getByText("<script>alert(1)</script>")).toBeInTheDocument();
    expect(container.querySelector("script")).toBeNull();
  });
});
