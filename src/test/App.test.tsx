import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../App";

describe("App Component", () => {
  it("renders the main heading", () => {
    render(<App />);

    const heading = screen.getByRole("heading", {
      name: /github repositories explorer/i,
    });

    expect(heading).toBeInTheDocument();
  });

  it("renders the search input", () => {
    render(<App />);

    const searchInput = screen.getByRole("textbox", {
      name: /search github users/i,
    });

    expect(searchInput).toBeInTheDocument();
  });

  it("shows get started message initially", () => {
    render(<App />);

    const getStartedHeading = screen.getByRole("heading", {
      name: /get started/i,
    });

    expect(getStartedHeading).toBeInTheDocument();
  });
});
