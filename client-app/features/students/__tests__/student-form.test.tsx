import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StudentForm } from "../components/student-form";

describe("StudentForm", () => {
  it("renders four labelled fields with contract limits", () => {
    render(<StudentForm mode="create" onSubmit={vi.fn()} />);

    expect(screen.getByRole("textbox", { name: "ชื่อ" })).toHaveAttribute(
      "maxlength",
      "100",
    );
    expect(screen.getByRole("textbox", { name: "นามสกุล" })).toHaveAttribute(
      "maxlength",
      "100",
    );
    expect(screen.getByRole("textbox", { name: "ชื่อเล่น" })).toHaveAttribute(
      "maxlength",
      "50",
    );
    expect(screen.getByLabelText("วันเกิด")).toHaveAttribute("type", "date");
  });

  it("marks every field as required", () => {
    render(<StudentForm mode="create" onSubmit={vi.fn()} />);

    for (const name of ["ชื่อ", "นามสกุล", "ชื่อเล่น", "วันเกิด"]) {
      expect(screen.getByLabelText(name)).toBeRequired();
    }
  });

  it("does not allow a future date in the date picker", () => {
    render(<StudentForm mode="create" onSubmit={vi.fn()} />);

    expect(screen.getByLabelText("วันเกิด")).toHaveAttribute(
      "max",
      new Date().toISOString().slice(0, 10),
    );
  });

  it("uses empty defaults in create mode", () => {
    render(<StudentForm mode="create" onSubmit={vi.fn()} />);

    for (const name of ["ชื่อ", "นามสกุล", "ชื่อเล่น", "วันเกิด"]) {
      expect(screen.getByLabelText(name)).toHaveValue("");
    }
  });

  it("loads existing values in edit mode", () => {
    render(
      <StudentForm
        mode="edit"
        initialValue={{
          birthDate: "2005-05-20",
          firstName: "สมชาย",
          lastName: "ใจดี",
          nickname: "ชาย",
        }}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("ชื่อ")).toHaveValue("สมชาย");
    expect(screen.getByLabelText("นามสกุล")).toHaveValue("ใจดี");
    expect(screen.getByLabelText("ชื่อเล่น")).toHaveValue("ชาย");
    expect(screen.getByLabelText("วันเกิด")).toHaveValue("2005-05-20");
  });

  it("submits normalized form values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<StudentForm mode="create" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("ชื่อ"), "  สมชาย  ");
    await user.type(screen.getByLabelText("นามสกุล"), " ใจดี ");
    await user.type(screen.getByLabelText("ชื่อเล่น"), " ชาย ");
    await user.type(screen.getByLabelText("วันเกิด"), "2005-05-20");
    await user.click(screen.getByRole("button", { name: "บันทึกข้อมูล" }));

    expect(onSubmit).toHaveBeenCalledWith({
      birthDate: "2005-05-20",
      firstName: "สมชาย",
      lastName: "ใจดี",
      nickname: "ชาย",
    });
  });

  it.each(["ชื่อ", "นามสกุล", "ชื่อเล่น"])(
    "shows an accessible error for whitespace-only %s",
    async (name) => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<StudentForm mode="create" onSubmit={onSubmit} />);

      await user.type(screen.getByLabelText(name), "   ");
      await user.click(screen.getByRole("button", { name: "บันทึกข้อมูล" }));

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    },
  );

  it("shows an accessible error for a future birth date", async () => {
    const user = userEvent.setup();
    render(<StudentForm mode="create" onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText("วันเกิด"), "2999-01-01");
    await user.click(screen.getByRole("button", { name: "บันทึกข้อมูล" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "วันเกิดต้องไม่เกินวันปัจจุบัน",
    );
  });

  it("disables duplicate submission while saving", async () => {
    const user = userEvent.setup();
    let resolveSubmit: () => void = () => undefined;
    const onSubmit = vi.fn(
      () => new Promise<void>((resolve) => (resolveSubmit = resolve)),
    );
    render(
      <StudentForm
        mode="edit"
        initialValue={{
          birthDate: "2005-05-20",
          firstName: "สมชาย",
          lastName: "ใจดี",
          nickname: "ชาย",
        }}
        onSubmit={onSubmit}
      />,
    );

    const button = screen.getByRole("button", { name: "บันทึกการแก้ไข" });
    await user.click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("กำลังบันทึก");
    await user.click(button);
    expect(onSubmit).toHaveBeenCalledTimes(1);

    resolveSubmit();
    await waitFor(() => expect(button).toBeEnabled());
  });

  it("shows a submit failure without clearing user input", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error("บันทึกไม่สำเร็จ"));
    render(
      <StudentForm
        mode="edit"
        initialValue={{
          birthDate: "2005-05-20",
          firstName: "สมชาย",
          lastName: "ใจดี",
          nickname: "ชาย",
        }}
        onSubmit={onSubmit}
      />,
    );

    await user.clear(screen.getByLabelText("ชื่อเล่น"));
    await user.type(screen.getByLabelText("ชื่อเล่น"), "ใหม่");
    await user.click(screen.getByRole("button", { name: "บันทึกการแก้ไข" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "บันทึกไม่สำเร็จ",
    );
    expect(screen.getByLabelText("ชื่อเล่น")).toHaveValue("ใหม่");
  });

  it("calls onCancel without submitting", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onSubmit = vi.fn();
    render(
      <StudentForm mode="create" onCancel={onCancel} onSubmit={onSubmit} />,
    );

    await user.click(screen.getByRole("button", { name: "ยกเลิก" }));

    expect(onCancel).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
