import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";

describe("Home", () => {
  it("renders the starter page", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /to get started/i,
      }),
    ).toBeInTheDocument();
  });
});
