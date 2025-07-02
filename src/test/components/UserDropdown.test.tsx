import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserDropdown } from "../../components/UserDropdown";
import type { GithubUser, GithubRepository } from "../../types/github";

// Mock window.open for RepositoryList
const mockWindowOpen = vi.fn();
vi.stubGlobal("window", {
  ...window,
  open: mockWindowOpen,
});

const mockUser: GithubUser = {
  id: 1,
  login: "testuser",
  avatar_url: "https://avatars.githubusercontent.com/u/1?v=4",
  html_url: "https://github.com/testuser",
  type: "User",
  name: "Test User",
  bio: "A test user",
  location: "Test City",
  public_repos: 10,
  followers: 100,
  following: 50,
  created_at: "2020-01-01T00:00:00Z",
};

const mockRepositories: GithubRepository[] = [
  {
    id: 1,
    name: "test-repo",
    full_name: "testuser/test-repo",
    description: "A test repository",
    html_url: "https://github.com/testuser/test-repo",
    stargazers_count: 42,
    watchers_count: 10,
    forks_count: 5,
    language: "TypeScript",
    updated_at: "2023-12-01T10:00:00Z",
    created_at: "2023-01-01T10:00:00Z",
    topics: ["test"],
    visibility: "public",
    default_branch: "main",
  },
];

describe("UserDropdown Component", () => {
  const mockOnToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering - Collapsed State", () => {
    it("renders user information when collapsed", () => {
      render(
        <UserDropdown
          user={mockUser}
          repositories={[]}
          isExpanded={false}
          isLoadingRepos={false}
          reposError={null}
          onToggle={mockOnToggle}
        />
      );

      expect(screen.getByText("testuser")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { expanded: false })
      ).toBeInTheDocument();
    });

    it("shows chevron down icon when collapsed", () => {
      render(
        <UserDropdown
          user={mockUser}
          repositories={[]}
          isExpanded={false}
          isLoadingRepos={false}
          reposError={null}
          onToggle={mockOnToggle}
        />
      );

      // ChevronDown should be present, ChevronUp should not
      expect(screen.queryByTestId("chevron-up")).not.toBeInTheDocument();
    });

    it("does not show repository content when collapsed", () => {
      render(
        <UserDropdown
          user={mockUser}
          repositories={mockRepositories}
          isExpanded={false}
          isLoadingRepos={false}
          reposError={null}
          onToggle={mockOnToggle}
        />
      );

      expect(screen.queryByText("test-repo")).not.toBeInTheDocument();
    });
  });

  describe("Rendering - Expanded State", () => {
    it("renders user information when expanded", () => {
      render(
        <UserDropdown
          user={mockUser}
          repositories={[]}
          isExpanded={true}
          isLoadingRepos={false}
          reposError={null}
          onToggle={mockOnToggle}
        />
      );

      expect(screen.getByText("testuser")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { expanded: true })
      ).toBeInTheDocument();
    });

    it("shows chevron up icon when expanded", () => {
      render(
        <UserDropdown
          user={mockUser}
          repositories={[]}
          isExpanded={true}
          isLoadingRepos={false}
          reposError={null}
          onToggle={mockOnToggle}
        />
      );

      // ChevronUp should be present, ChevronDown should not
      expect(screen.queryByTestId("chevron-down")).not.toBeInTheDocument();
    });

    it("shows repository content area when expanded", () => {
      render(
        <UserDropdown
          user={mockUser}
          repositories={[]}
          isExpanded={true}
          isLoadingRepos={false}
          reposError={null}
          onToggle={mockOnToggle}
        />
      );

      // Look for the content area by its ID instead of role
      const contentArea = document.getElementById(`repos-${mockUser.id}`);
      expect(contentArea).toBeInTheDocument();
    });
  });

  describe("Repository States", () => {
    it("shows loading state when repositories are being fetched", () => {
      render(
        <UserDropdown
          user={mockUser}
          repositories={[]}
          isExpanded={true}
          isLoadingRepos={true}
          reposError={null}
          onToggle={mockOnToggle}
        />
      );

      expect(screen.getByText("Loading repositories...")).toBeInTheDocument();
      // Look for the loading spinner by its CSS class instead of role
      const spinner = document.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    it("shows error state when repository loading fails", () => {
      const errorMessage = "Failed to load repositories";
      render(
        <UserDropdown
          user={mockUser}
          repositories={[]}
          isExpanded={true}
          isLoadingRepos={false}
          reposError={errorMessage}
          onToggle={mockOnToggle}
        />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it("shows empty state when user has no repositories", () => {
      render(
        <UserDropdown
          user={mockUser}
          repositories={[]}
          isExpanded={true}
          isLoadingRepos={false}
          reposError={null}
          onToggle={mockOnToggle}
        />
      );

      expect(
        screen.getByText("No public repositories found")
      ).toBeInTheDocument();
    });

    it("shows repositories when available", () => {
      render(
        <UserDropdown
          user={mockUser}
          repositories={mockRepositories}
          isExpanded={true}
          isLoadingRepos={false}
          reposError={null}
          onToggle={mockOnToggle}
        />
      );

      expect(screen.getByText("test-repo")).toBeInTheDocument();
      expect(screen.getByText("A test repository")).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("calls onToggle when user button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <UserDropdown
          user={mockUser}
          repositories={[]}
          isExpanded={false}
          isLoadingRepos={false}
          reposError={null}
          onToggle={mockOnToggle}
        />
      );

      const toggleButton = screen.getByRole("button", { expanded: false });
      await user.click(toggleButton);

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it("calls onToggle when Enter key is pressed", async () => {
      const user = userEvent.setup();
      render(
        <UserDropdown
          user={mockUser}
          repositories={[]}
          isExpanded={false}
          isLoadingRepos={false}
          reposError={null}
          onToggle={mockOnToggle}
        />
      );

      const toggleButton = screen.getByRole("button", { expanded: false });
      toggleButton.focus();
      await user.keyboard("{Enter}");

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it("calls onToggle when Space key is pressed", async () => {
      const user = userEvent.setup();
      render(
        <UserDropdown
          user={mockUser}
          repositories={[]}
          isExpanded={false}
          isLoadingRepos={false}
          reposError={null}
          onToggle={mockOnToggle}
        />
      );

      const toggleButton = screen.getByRole("button", { expanded: false });
      toggleButton.focus();
      await user.keyboard(" ");

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA attributes", () => {
      render(
        <UserDropdown
          user={mockUser}
          repositories={[]}
          isExpanded={false}
          isLoadingRepos={false}
          reposError={null}
          onToggle={mockOnToggle}
        />
      );

      const toggleButton = screen.getByRole("button");
      expect(toggleButton).toHaveAttribute("aria-expanded", "false");
      expect(toggleButton).toHaveAttribute(
        "aria-controls",
        `repos-${mockUser.id}`
      );
    });

    it("updates aria-expanded when state changes", () => {
      const { rerender } = render(
        <UserDropdown
          user={mockUser}
          repositories={[]}
          isExpanded={false}
          isLoadingRepos={false}
          reposError={null}
          onToggle={mockOnToggle}
        />
      );

      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-expanded",
        "false"
      );

      rerender(
        <UserDropdown
          user={mockUser}
          repositories={[]}
          isExpanded={true}
          isLoadingRepos={false}
          reposError={null}
          onToggle={mockOnToggle}
        />
      );

      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-expanded",
        "true"
      );
    });

    it("has proper id for controlled content", () => {
      render(
        <UserDropdown
          user={mockUser}
          repositories={[]}
          isExpanded={true}
          isLoadingRepos={false}
          reposError={null}
          onToggle={mockOnToggle}
        />
      );

      // Look for the element with the correct ID
      const contentArea = document.getElementById(`repos-${mockUser.id}`);
      expect(contentArea).toBeInTheDocument();
    });

    it("supports keyboard navigation", async () => {
      const user = userEvent.setup();
      render(
        <UserDropdown
          user={mockUser}
          repositories={[]}
          isExpanded={false}
          isLoadingRepos={false}
          reposError={null}
          onToggle={mockOnToggle}
        />
      );

      await user.tab();
      expect(screen.getByRole("button")).toHaveFocus();
    });
  });

  describe("Integration with RepositoryList", () => {
    it("passes repositories to RepositoryList component", () => {
      render(
        <UserDropdown
          user={mockUser}
          repositories={mockRepositories}
          isExpanded={true}
          isLoadingRepos={false}
          reposError={null}
          onToggle={mockOnToggle}
        />
      );

      // Repository content should be rendered by RepositoryList
      expect(screen.getByText("test-repo")).toBeInTheDocument();
      expect(screen.getByText("42")).toBeInTheDocument(); // Star count
    });

    it("allows interaction with repository links", async () => {
      const user = userEvent.setup();
      render(
        <UserDropdown
          user={mockUser}
          repositories={mockRepositories}
          isExpanded={true}
          isLoadingRepos={false}
          reposError={null}
          onToggle={mockOnToggle}
        />
      );

      const repoButton = screen.getByRole("button", { name: "test-repo" });
      await user.click(repoButton);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        "https://github.com/testuser/test-repo",
        "_blank",
        "noopener,noreferrer"
      );
    });
  });

  describe("Component Structure", () => {
    it("has proper CSS classes for styling", () => {
      render(
        <UserDropdown
          user={mockUser}
          repositories={[]}
          isExpanded={false}
          isLoadingRepos={false}
          reposError={null}
          onToggle={mockOnToggle}
        />
      );

      const container = screen.getByRole("button").closest("div");
      expect(container).toHaveClass(
        "border",
        "border-gray-300",
        "rounded-md",
        "bg-white"
      );
    });

    it("applies hover and focus styles", () => {
      render(
        <UserDropdown
          user={mockUser}
          repositories={[]}
          isExpanded={false}
          isLoadingRepos={false}
          reposError={null}
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass("hover:bg-gray-50", "focus:bg-gray-50");
    });
  });
});
