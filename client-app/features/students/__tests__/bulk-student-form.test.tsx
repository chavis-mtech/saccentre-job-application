import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BulkStudentForm } from "../components/bulk-student-form";

describe("BulkStudentForm", () => {
  it("adds and removes input rows", async () => {
    const user = userEvent.setup();
    render(<BulkStudentForm onCancel={vi.fn()} onSubmit={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /เพิ่มแถว/ }));
    expect(screen.getAllByLabelText("ชื่อ", { exact: true })).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "ลบแถวที่ 2" }));
    expect(screen.getAllByLabelText("ชื่อ", { exact: true })).toHaveLength(1);
  });

  it("submits every normalized row together", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<BulkStudentForm onCancel={vi.fn()} onSubmit={onSubmit} />);
    await user.click(screen.getByRole("button", { name: /เพิ่มแถว/ }));

    const names = screen.getAllByLabelText("ชื่อ", { exact: true });
    const lastNames = screen.getAllByLabelText("นามสกุล");
    const nicknames = screen.getAllByLabelText("ชื่อเล่น");
    const birthDates = screen.getAllByLabelText("วันเกิด");
    await user.type(names[0], " สมชาย ");
    await user.type(lastNames[0], " ใจดี ");
    await user.type(nicknames[0], " ชาย ");
    await user.type(birthDates[0], "2005-05-20");
    await user.type(names[1], "สุดา");
    await user.type(lastNames[1], "ดีใจ");
    await user.type(nicknames[1], "ดา");
    await user.type(birthDates[1], "2006-06-21");
    await user.click(screen.getByRole("button", { name: "บันทึกข้อมูล" }));

    expect(onSubmit).toHaveBeenCalledWith([
      {
        birthDate: "2005-05-20",
        firstName: "สมชาย",
        lastName: "ใจดี",
        nickname: "ชาย",
      },
      {
        birthDate: "2006-06-21",
        firstName: "สุดา",
        lastName: "ดีใจ",
        nickname: "ดา",
      },
    ]);
  });

  it("identifies an invalid row without submitting", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<BulkStudentForm onCancel={vi.fn()} onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: /เพิ่มแถว/ }));
    await user.click(screen.getByRole("button", { name: "บันทึกข้อมูล" }));

    expect(screen.getByRole("alert")).toHaveTextContent("แถวที่ 1");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("cancels without submitting", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onSubmit = vi.fn();
    render(<BulkStudentForm onCancel={onCancel} onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "ยกเลิก" }));

    expect(onCancel).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
