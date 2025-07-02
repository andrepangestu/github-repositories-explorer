import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RepositoryList } from "../../components/RepositoryList";
import type { GithubRepository } from "../../types/github";

// Mock window.open
const mockWindowOpen = vi.fn();
vi.stubGlobal("window", {
  ...window,
  open: mockWindowOpen,
});

const mockRepositories: GithubRepository[] = [
  {
    id: 1,
    name: "awesome-repo",
    full_name: "user/awesome-repo",
    description: "An awesome repository for testing",
    html_url: "https://github.com/user/awesome-repo",
    stargazers_count: 1234,
    watchers_count: 100,
    forks_count: 56,
    language: "TypeScript",
    updated_at: "2023-12-01T10:00:00Z",
    created_at: "2023-01-01T10:00:00Z",
    topics: ["react", "typescript"],
    visibility: "public",
    default_branch: "main",
  },
  {
    id: 2,
    name: "simple-project",
    full_name: "user/simple-project",
    description: null,
    html_url: "https://github.com/user/simple-project",
    stargazers_count: 5,
    watchers_count: 2,
    forks_count: 1,
    language: "JavaScript",
    updated_at: "2023-11-15T15:30:00Z",
    created_at: "2023-10-01T12:00:00Z",
    topics: [],
    visibility: "public",
    default_branch: "master",
  },
  {
    id: 3,
    name: "mega-popular",
    full_name: "user/mega-popular",
    description: "A very popular repository",
    html_url: "https://github.com/user/mega-popular",
    stargazers_count: 1500000,
    watchers_count: 50000,
    forks_count: 25000,
    language: "Python",
    updated_at: "2023-12-15T08:45:00Z",
    created_at: "2020-05-10T14:20:00Z",
    topics: ["python", "machine-learning"],
    visibility: "public",
    default_branch: "main",
  },
];

describe("RepositoryList Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders list of repositories", () => {
      render(<RepositoryList repositories={mockRepositories} />);

      expect(screen.getByText("awesome-repo")).toBeInTheDocument();
      expect(screen.getByText("simple-project")).toBeInTheDocument();
      expect(screen.getByText("mega-popular")).toBeInTheDocument();
    });

    it("renders repository descriptions when available", () => {
      render(<RepositoryList repositories={mockRepositories} />);

      expect(
        screen.getByText("An awesome repository for testing")
      ).toBeInTheDocument();
      expect(screen.getByText("A very popular repository")).toBeInTheDocument();
    });

    it("does not render description for repositories without one", () => {
      render(<RepositoryList repositories={[mockRepositories[1]]} />);

      // simple-project has no description
      expect(screen.queryByText("description")).not.toBeInTheDocument();
    });

    it("renders star counts correctly", () => {
      render(<RepositoryList repositories={mockRepositories} />);

      // Check formatted numbers
      expect(screen.getByText("1.2k")).toBeInTheDocument(); // 1234 stars
      expect(screen.getByText("5")).toBeInTheDocument(); // 5 stars
      expect(screen.getByText("1.5M")).toBeInTheDocument(); // 1500000 stars
    });

    it("renders star icons", () => {
      render(<RepositoryList repositories={mockRepositories} />);

      // Should have star icons - look for SVG elements with the star class
      const starIcons = document.querySelectorAll('svg.lucide-star');
      expect(starIcons.length).toBeGreaterThan(0);
    });
  });

  describe("Number Formatting", () => {
    it("formats numbers correctly", () => {
      const testCases = [
        { count: 5, expected: "5" },
        { count: 999, expected: "999" },
        { count: 1000, expected: "1.0k" },
        { count: 1234, expected: "1.2k" },
        { count: 10000, expected: "10.0k" },
        { count: 999999, expected: "1000.0k" },
        { count: 1000000, expected: "1.0M" },
        { count: 1500000, expected: "1.5M" },
      ];

      testCases.forEach(({ count, expected }) => {
        const repo = { ...mockRepositories[0], stargazers_count: count };
        const { unmount } = render(<RepositoryList repositories={[repo]} />);

        expect(screen.getByText(expected)).toBeInTheDocument();

        // Clean up for next test
        unmount();
      });
    });
  });

  describe("Repository Links", () => {
    it("makes repository titles clickable", () => {
      render(<RepositoryList repositories={[mockRepositories[0]]} />);

      const repoButton = screen.getByRole("button", { name: "awesome-repo" });
      expect(repoButton).toBeInTheDocument();
      expect(repoButton).toHaveAttribute(
        "title",
        "Open awesome-repo on GitHub"
      );
    });

    it("opens repository URL when title is clicked", async () => {
      const user = userEvent.setup();
      render(<RepositoryList repositories={[mockRepositories[0]]} />);

      const repoButton = screen.getByRole("button", { name: "awesome-repo" });

      await user.click(repoButton);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        "https://github.com/user/awesome-repo",
        "_blank",
        "noopener,noreferrer"
      );
    });

    it("opens correct URL for each repository", async () => {
      const user = userEvent.setup();
      render(<RepositoryList repositories={mockRepositories} />);

      // Test first repository
      const awesomeRepoButton = screen.getByRole("button", {
        name: "awesome-repo",
      });
      await user.click(awesomeRepoButton);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        "https://github.com/user/awesome-repo",
        "_blank",
        "noopener,noreferrer"
      );

      // Test second repository
      const simpleProjectButton = screen.getByRole("button", {
        name: "simple-project",
      });
      await user.click(simpleProjectButton);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        "https://github.com/user/simple-project",
        "_blank",
        "noopener,noreferrer"
      );
    });
  });

  describe("Accessibility", () => {
    it("has proper button semantics for repository titles", () => {
      render(<RepositoryList repositories={[mockRepositories[0]]} />);

      const repoButton = screen.getByRole("button", { name: "awesome-repo" });
      expect(repoButton).toHaveAttribute("type", "button");
      expect(repoButton).toHaveAttribute(
        "title",
        "Open awesome-repo on GitHub"
      );
    });

    it("supports keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<RepositoryList repositories={mockRepositories} />);

      // Tab through repository buttons
      await user.tab();
      expect(
        screen.getByRole("button", { name: "awesome-repo" })
      ).toHaveFocus();

      await user.tab();
      expect(
        screen.getByRole("button", { name: "simple-project" })
      ).toHaveFocus();

      await user.tab();
      expect(
        screen.getByRole("button", { name: "mega-popular" })
      ).toHaveFocus();
    });

    it("activates repository link on Enter key", async () => {
      const user = userEvent.setup();
      render(<RepositoryList repositories={[mockRepositories[0]]} />);

      const repoButton = screen.getByRole("button", { name: "awesome-repo" });
      repoButton.focus();

      await user.keyboard("{Enter}");

      expect(mockWindowOpen).toHaveBeenCalledWith(
        "https://github.com/user/awesome-repo",
        "_blank",
        "noopener,noreferrer"
      );
    });
  });

  describe("Empty State", () => {
    it("renders empty list without errors", () => {
      render(<RepositoryList repositories={[]} />);

      // Should render container but no repository items
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("Component Structure", () => {
    it("has proper CSS classes for styling", () => {
      render(<RepositoryList repositories={[mockRepositories[0]]} />);

      // Look for the repository container (parent of the button)
      const repoButton = screen.getByRole("button", { name: "awesome-repo" });
      const repoContainer = repoButton.closest(".bg-gray-50");
      expect(repoContainer).toBeInTheDocument();
    });

    it("maintains proper layout structure", () => {
      render(<RepositoryList repositories={mockRepositories} />);

      // Should have proper container structure
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(3);

      // Each repository should have star count displayed
      expect(screen.getByText("1.2k")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("1.5M")).toBeInTheDocument();
    });
  });
});
