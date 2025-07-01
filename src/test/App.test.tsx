import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../App";

describe("App Component", () => {
  it("renders the search input", () => {
    render(<App />);

    const searchInput = screen.getByRole("textbox");
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute("placeholder", "Enter username");
  });

  it("renders the search button", () => {
    render(<App />);

    const searchButton = screen.getByRole("button", { name: /search/i });
    expect(searchButton).toBeInTheDocument();
  });

  it("has proper form structure", () => {
    render(<App />);

    const searchInput = screen.getByRole("textbox");
    const searchButton = screen.getByRole("button", { name: /search/i });

    expect(searchInput).toHaveAttribute("aria-label", "Enter GitHub username");
    expect(searchButton).toHaveAttribute("type", "submit");
  });
});
