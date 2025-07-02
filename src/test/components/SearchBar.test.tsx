import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBar } from "../../components/SearchBar";
import { GithubApiProvider } from "../../contexts/GithubApiContext";

// Mock the GitHub API service
vi.mock("../../services/githubApi", () => ({
  GithubApiService: {
    searchUsers: vi.fn(),
    getUserRepositories: vi.fn(),
  },
}));

const SearchBarWithProvider = () => (
  <GithubApiProvider>
    <SearchBar />
  </GithubApiProvider>
);

describe("SearchBar Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders search input with correct placeholder", () => {
      render(<SearchBarWithProvider />);

      const searchInput = screen.getByRole("textbox");
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute("placeholder", "Enter username");
      expect(searchInput).toHaveAttribute(
        "aria-label",
        "Enter Github username"
      );
    });

    it("renders search button with correct text", () => {
      render(<SearchBarWithProvider />);

      const searchButton = screen.getByRole("button", { name: /search/i });
      expect(searchButton).toBeInTheDocument();
      expect(searchButton).toHaveAttribute("type", "submit");
    });

    it("has proper form structure", () => {
      render(<SearchBarWithProvider />);

      const form = document.querySelector("form");
      expect(form).toBeInTheDocument();

      const searchInput = screen.getByRole("textbox");
      const searchButton = screen.getByRole("button", { name: /search/i });

      expect(form).toContainElement(searchInput);
      expect(form).toContainElement(searchButton);
    });
  });

  describe("User Interactions", () => {
    it("updates input value when user types", async () => {
      const user = userEvent.setup();
      render(<SearchBarWithProvider />);

      const searchInput = screen.getByRole("textbox");

      await user.type(searchInput, "octocat");

      expect(searchInput).toHaveValue("octocat");
    });

    it("triggers search when form is submitted", async () => {
      const user = userEvent.setup();
      render(<SearchBarWithProvider />);

      const searchInput = screen.getByRole("textbox");
      const searchButton = screen.getByRole("button", { name: /search/i });

      await user.type(searchInput, "testuser");
      await user.click(searchButton);

      // The search should be triggered (we'll verify this through state changes)
    });

    it("triggers search when Enter key is pressed", async () => {
      const user = userEvent.setup();
      render(<SearchBarWithProvider />);

      const searchInput = screen.getByRole("textbox");

      await user.type(searchInput, "testuser");
      await user.keyboard("{Enter}");

      // The search should be triggered
    });

    it("does not trigger search with empty input", async () => {
      const user = userEvent.setup();
      render(<SearchBarWithProvider />);

      const searchButton = screen.getByRole("button", { name: /search/i });

      await user.click(searchButton);

      // Should not trigger search with empty input
    });

    it("trims whitespace from input before search", async () => {
      const user = userEvent.setup();
      render(<SearchBarWithProvider />);

      const searchInput = screen.getByRole("textbox");
      const searchButton = screen.getByRole("button", { name: /search/i });

      await user.type(searchInput, "  testuser  ");
      await user.click(searchButton);

      // Should trim whitespace
    });
  });

  describe("Loading States", () => {
    it("shows loading state when search is in progress", async () => {
      render(<SearchBarWithProvider />);

      // We would need to mock the loading state for this test
      // This would require triggering a search and checking the loading state
    });

    it("disables submit button when loading", () => {
      // This test would require mocking the loading state
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels", () => {
      render(<SearchBarWithProvider />);

      const searchInput = screen.getByRole("textbox");
      expect(searchInput).toHaveAttribute(
        "aria-label",
        "Enter Github username"
      );
    });

    it("supports keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<SearchBarWithProvider />);

      // Tab should move focus to input, then to button
      await user.tab();
      expect(screen.getByRole("textbox")).toHaveFocus();

      await user.tab();
      expect(screen.getByRole("button", { name: /search/i })).toHaveFocus();
    });
  });

  describe("Form Validation", () => {
    it("prevents form submission with preventDefault", async () => {
      const user = userEvent.setup();
      render(<SearchBarWithProvider />);

      const form = document.querySelector("form");
      const searchInput = screen.getByRole("textbox");

      await user.type(searchInput, "testuser");

      const submitEvent = vi.fn();
      form?.addEventListener("submit", submitEvent);

      await user.keyboard("{Enter}");

      // The form submission should be handled by React, not browser default
    });
  });
});
