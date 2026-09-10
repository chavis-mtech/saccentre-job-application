import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Home from "@/app/page";

vi.mock("@/features/students/components/students-screen", () => ({
  StudentsScreen: () => <h1>ข้อมูลนักเรียน</h1>,
}));

describe("Home", () => {
  it("renders student management as the default page", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: "ข้อมูลนักเรียน" }),
    ).toBeInTheDocument();
  });
});
