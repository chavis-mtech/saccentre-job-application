import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DeleteStudentDialog } from "../components/delete-student-dialog";
import { student } from "./fixtures";

describe("DeleteStudentDialog", () => {
  it("renders nothing while closed", () => {
    render(
      <DeleteStudentDialog
        open={false}
        student={student()}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("identifies the student before destructive confirmation", () => {
    render(
      <DeleteStudentDialog
        open
        student={student()}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByRole("alertdialog")).toHaveAccessibleName("ยืนยันการลบ");
    expect(screen.getByText(/สมชาย ใจดี/)).toBeInTheDocument();
  });

  it("cancels without confirming", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(
      <DeleteStudentDialog
        open
        student={student()}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole("button", { name: "ยกเลิก" }));

    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("confirms exactly once while deletion is pending", async () => {
    const user = userEvent.setup();
    let resolveDelete: () => void = () => undefined;
    const onConfirm = vi.fn(
      () => new Promise<void>((resolve) => (resolveDelete = resolve)),
    );
    render(
      <DeleteStudentDialog
        open
        student={student()}
        onCancel={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    const button = screen.getByRole("button", { name: "ยืนยันการลบ" });
    await user.click(button);
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onConfirm).toHaveBeenCalledTimes(1);

    resolveDelete();
    await waitFor(() => expect(button).toBeEnabled());
  });

  it("disables both actions when parent reports a pending deletion", () => {
    render(
      <DeleteStudentDialog
        isPending
        open
        student={student()}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "กำลังลบ" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "ยกเลิก" })).toBeDisabled();
  });
});
