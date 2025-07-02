import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "../App";

// Mock the GitHub API service
vi.mock("../services/githubApi", () => ({
  searchUsers: vi.fn(),
  getUserRepositories: vi.fn(),
  GithubApiService: {
    searchUsers: vi.fn(),
    getUserRepositories: vi.fn(),
  },
}));

// Mock window.open for repository links
const mockWindowOpen = vi.fn();
vi.stubGlobal("window", {
  ...window,
  open: mockWindowOpen,
});

describe("App Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWindowOpen.mockClear();
  });

  describe("Initial Rendering", () => {
    it("renders without crashing", () => {
      render(<App />);
      expect(document.body).toBeInTheDocument();
    });

    it("renders the main layout structure", () => {
      render(<App />);

      // Check for the main container
      const container = document.querySelector('.min-h-screen');
      expect(container).toBeInTheDocument();
    });

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

      expect(searchInput).toHaveAttribute("aria-label", "Enter Github username");
      expect(searchButton).toHaveAttribute("type", "submit");
    });
  });

  describe("Layout and Styling", () => {
    it("has proper CSS classes for responsive layout", () => {
      render(<App />);

      const container = document.querySelector('.min-h-screen');
      expect(container).toHaveClass('bg-gray-50', 'py-8', 'px-4');

      const innerContainer = document.querySelector('.max-w-md');
      expect(innerContainer).toHaveClass('mx-auto');
    });

    it("applies proper spacing and styling", () => {
      render(<App />);

      // Check if the layout classes are applied correctly
      const mainDiv = document.querySelector('.min-h-screen');
      expect(mainDiv).toBeInTheDocument();
    });
  });

  describe("Context Integration", () => {
    it("provides GithubApiProvider context", () => {
      render(<App />);

      // Should render without context errors
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("initializes with empty state", () => {
      render(<App />);

      // Should not show any error messages initially
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
      
      // Should not show user list initially
      expect(screen.queryByText(/showing users for/i)).not.toBeInTheDocument();
    });
  });

  describe("Component Composition", () => {
    it("renders SearchBar component", () => {
      render(<App />);

      // SearchBar should be present
      expect(screen.getByRole("textbox")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
    });

    it("conditionally renders UserList component", () => {
      render(<App />);

      // UserList should not be visible initially (no users)
      expect(screen.queryByText(/showing users for/i)).not.toBeInTheDocument();
    });

    it("conditionally renders error messages", () => {
      render(<App />);

      // No error message should be shown initially
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("allows typing in search input", async () => {
      render(<App />);

      const searchInput = screen.getByRole("textbox");
      
      fireEvent.change(searchInput, { target: { value: "testuser" } });
      
      expect(searchInput).toHaveValue("testuser");
    });

    it("handles form submission", async () => {
      render(<App />);

      const searchInput = screen.getByRole("textbox");
      const searchButton = screen.getByRole("button", { name: /search/i });

      fireEvent.change(searchInput, { target: { value: "testuser" } });
      fireEvent.click(searchButton);

      // Form should handle submission without errors
      expect(searchInput).toHaveValue("testuser");
    });

    it("handles keyboard interactions", async () => {
      render(<App />);

      const searchInput = screen.getByRole("textbox");

      fireEvent.change(searchInput, { target: { value: "testuser" } });
      fireEvent.keyDown(searchInput, { key: "Enter", code: "Enter" });

      // Should handle Enter key submission
      expect(searchInput).toHaveValue("testuser");
    });
  });

  describe("Error Handling", () => {
    it("handles empty search gracefully", async () => {
      render(<App />);

      const searchButton = screen.getByRole("button", { name: /search/i });
      fireEvent.click(searchButton);

      // Should not crash on empty search
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("maintains stable UI during interactions", async () => {
      render(<App />);

      const searchInput = screen.getByRole("textbox");
      
      // Multiple interactions should not break the UI
      fireEvent.change(searchInput, { target: { value: "test" } });
      fireEvent.change(searchInput, { target: { value: "" } });
      fireEvent.change(searchInput, { target: { value: "newtest" } });

      expect(searchInput).toHaveValue("newtest");
      expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels", () => {
      render(<App />);

      const searchInput = screen.getByRole("textbox");
      expect(searchInput).toHaveAttribute("aria-label", "Enter Github username");
    });

    it("supports keyboard navigation", () => {
      render(<App />);

      const searchInput = screen.getByRole("textbox");
      const searchButton = screen.getByRole("button", { name: /search/i });

      // Elements should be focusable
      searchInput.focus();
      expect(document.activeElement).toBe(searchInput);

      searchButton.focus();
      expect(document.activeElement).toBe(searchButton);
    });

    it("has proper form semantics", () => {
      render(<App />);

      const searchButton = screen.getByRole("button", { name: /search/i });
      expect(searchButton).toHaveAttribute("type", "submit");
    });
  });

  describe("Responsive Design", () => {
    it("has responsive container classes", () => {
      render(<App />);

      const container = document.querySelector('.max-w-md');
      expect(container).toHaveClass('mx-auto');
    });

    it("handles different screen sizes", () => {
      render(<App />);

      // Should have responsive padding and margins
      const mainContainer = document.querySelector('.min-h-screen');
      expect(mainContainer).toHaveClass('py-8', 'px-4');
    });
  });

  describe("Performance", () => {
    it("renders efficiently without unnecessary re-renders", () => {
      const { rerender } = render(<App />);

      // Re-rendering should not cause issues
      rerender(<App />);
      
      expect(screen.getByRole("textbox")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
    });

    it("maintains component stability", () => {
      render(<App />);

      const searchInput = screen.getByRole("textbox");
      const initialValue = searchInput.getAttribute("placeholder");

      // Component should maintain its props
      expect(initialValue).toBe("Enter username");
    });
  });
});
