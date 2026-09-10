import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudentsApi } from "../api/students-api";
import { StudentsScreen } from "../components/students-screen";
import { student } from "./fixtures";

describe("StudentsScreen", () => {
  const emptyPage = {
    data: [],
    meta: { limit: 20, page: 1, total: 0, totalPages: 0 },
  };

  beforeEach(() => {
    vi.spyOn(StudentsApi.prototype, "list").mockResolvedValue(emptyPage);
    vi.spyOn(StudentsApi.prototype, "create").mockResolvedValue(student());
    vi.spyOn(StudentsApi.prototype, "createMany").mockResolvedValue([
      student(),
    ]);
    vi.spyOn(StudentsApi.prototype, "update").mockResolvedValue(student());
    vi.spyOn(StudentsApi.prototype, "remove").mockResolvedValue();
  });

  afterEach(() => vi.restoreAllMocks());

  it("loads and renders the first page", async () => {
    vi.mocked(StudentsApi.prototype.list).mockResolvedValue({
      data: [student()],
      meta: { limit: 20, page: 1, total: 1, totalPages: 1 },
    });

    render(<StudentsScreen />);

    expect(screen.getByRole("status")).toHaveTextContent("กำลังโหลด");
    expect(await screen.findByText("สมชาย")).toBeInTheDocument();
    expect(StudentsApi.prototype.list).toHaveBeenCalledWith({ page: 1 });
  });

  it("shows an empty state after loading", async () => {
    render(<StudentsScreen />);

    expect(
      await screen.findByText("ยังไม่มีข้อมูลนักเรียน"),
    ).toBeInTheDocument();
  });

  it("shows a recoverable load error", async () => {
    const user = userEvent.setup();
    vi.mocked(StudentsApi.prototype.list)
      .mockRejectedValueOnce(new Error("โหลดข้อมูลไม่สำเร็จ"))
      .mockResolvedValueOnce(emptyPage);

    render(<StudentsScreen />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "โหลดข้อมูลไม่สำเร็จ",
    );
    await user.click(screen.getByRole("button", { name: "ลองอีกครั้ง" }));
    expect(
      await screen.findByText("ยังไม่มีข้อมูลนักเรียน"),
    ).toBeInTheDocument();
    expect(StudentsApi.prototype.list).toHaveBeenCalledTimes(2);
  });

  it("searches from page one and preserves Thai text", async () => {
    const user = userEvent.setup();
    render(<StudentsScreen />);
    await screen.findByText("ยังไม่มีข้อมูลนักเรียน");

    await user.type(
      screen.getByRole("searchbox", { name: "ค้นหานักเรียน" }),
      "สมชาย",
    );
    await user.click(screen.getByRole("button", { name: "ค้นหา" }));

    expect(StudentsApi.prototype.list).toHaveBeenLastCalledWith({
      page: 1,
      search: "สมชาย",
    });
  });

  it("creates a student then reloads the current list", async () => {
    const user = userEvent.setup();
    render(<StudentsScreen />);
    await screen.findByText("ยังไม่มีข้อมูลนักเรียน");

    await user.click(screen.getByRole("button", { name: "เพิ่มนักเรียน" }));
    await user.type(screen.getByLabelText("ชื่อ"), "สมชาย");
    await user.type(screen.getByLabelText("นามสกุล"), "ใจดี");
    await user.type(screen.getByLabelText("ชื่อเล่น"), "ชาย");
    await user.type(screen.getByLabelText("วันเกิด"), "2005-05-20");
    await user.click(screen.getByRole("button", { name: "บันทึกข้อมูล" }));

    await waitFor(() =>
      expect(StudentsApi.prototype.createMany).toHaveBeenCalledWith([
        {
          birthDate: "2005-05-20",
          firstName: "สมชาย",
          lastName: "ใจดี",
          nickname: "ชาย",
        },
      ]),
    );
    expect(screen.getByRole("status")).toHaveTextContent("เพิ่มข้อมูลสำเร็จ");
    expect(StudentsApi.prototype.list).toHaveBeenCalledTimes(2);
  });

  it("edits the selected student and reloads the list", async () => {
    const user = userEvent.setup();
    vi.mocked(StudentsApi.prototype.list).mockResolvedValue({
      data: [student()],
      meta: { limit: 20, page: 1, total: 1, totalPages: 1 },
    });
    render(<StudentsScreen />);
    const row = await screen.findByRole("row", { name: /สมชาย/ });

    await user.click(
      within(row).getByRole("button", { name: "แก้ไข สมชาย ใจดี" }),
    );
    await user.clear(screen.getByLabelText("ชื่อเล่น"));
    await user.type(screen.getByLabelText("ชื่อเล่น"), "ใหม่");
    await user.click(screen.getByRole("button", { name: "บันทึกการแก้ไข" }));

    await waitFor(() =>
      expect(StudentsApi.prototype.update).toHaveBeenCalledWith(student().id, {
        birthDate: "2005-05-20",
        firstName: "สมชาย",
        lastName: "ใจดี",
        nickname: "ใหม่",
      }),
    );
    expect(screen.getByRole("status")).toHaveTextContent("แก้ไขข้อมูลสำเร็จ");
  });

  it("deletes only after confirmation and reloads the list", async () => {
    const user = userEvent.setup();
    vi.mocked(StudentsApi.prototype.list).mockResolvedValue({
      data: [student()],
      meta: { limit: 20, page: 1, total: 1, totalPages: 1 },
    });
    render(<StudentsScreen />);
    const row = await screen.findByRole("row", { name: /สมชาย/ });

    await user.click(
      within(row).getByRole("button", { name: "ลบ สมชาย ใจดี" }),
    );
    expect(StudentsApi.prototype.remove).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "ยืนยันการลบ" }));

    await waitFor(() =>
      expect(StudentsApi.prototype.remove).toHaveBeenCalledWith(student().id),
    );
    expect(screen.getByRole("status")).toHaveTextContent("ลบข้อมูลสำเร็จ");
  });

  it("requests the selected pagination page", async () => {
    const user = userEvent.setup();
    vi.mocked(StudentsApi.prototype.list).mockResolvedValue({
      data: [student()],
      meta: { limit: 20, page: 1, total: 21, totalPages: 2 },
    });
    render(<StudentsScreen />);
    await screen.findByText("สมชาย");

    await user.click(screen.getByRole("button", { name: "หน้าถัดไป" }));

    expect(StudentsApi.prototype.list).toHaveBeenLastCalledWith({ page: 2 });
  });
});
