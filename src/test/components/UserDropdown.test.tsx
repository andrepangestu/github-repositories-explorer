import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserDropdown } from "../../components/UserDropdown";
import { render, mockUser, mockRepository } from "../test-utils";

const mockOnToggle = vi.fn();

const defaultProps = {
  user: mockUser,
  repositories: [],
  isExpanded: false,
  isLoadingRepos: false,
  reposError: null,
  onToggle: mockOnToggle,
};

describe("UserDropdown Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders user information correctly", () => {
    render(<UserDropdown {...defaultProps} />);

    expect(screen.getByText("testuser")).toBeInTheDocument();
    expect(screen.getByRole("button", { expanded: false })).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-expanded",
      "false"
    );
  });

  it("calls onToggle when user clicks the button", async () => {
    const user = userEvent.setup();
    render(<UserDropdown {...defaultProps} />);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it("shows chevron down icon when collapsed", () => {
    render(<UserDropdown {...defaultProps} />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-expanded", "false");

    const chevronDown =
      within(button).getByTestId("chevron-down") ||
      document.querySelector('[data-testid="chevron-down"]') ||
      button.querySelector("svg");
    expect(chevronDown).toBeInTheDocument();
  });

  it("shows chevron up icon when expanded", () => {
    render(<UserDropdown {...defaultProps} isExpanded={true} />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-expanded", "true");

    const chevronUp =
      within(button).getByTestId("chevron-up") ||
      document.querySelector('[data-testid="chevron-up"]') ||
      button.querySelector("svg");
    expect(chevronUp).toBeInTheDocument();
  });

  it("shows loading state when loading repositories", () => {
    render(
      <UserDropdown {...defaultProps} isExpanded={true} isLoadingRepos={true} />
    );

    expect(screen.getByText("Loading repositories...")).toBeInTheDocument();
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("displays error message when there is a repository error", () => {
    const errorMessage = "Failed to load repositories";
    render(
      <UserDropdown
        {...defaultProps}
        isExpanded={true}
        reposError={errorMessage}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("shows repositories when expanded and loaded", () => {
    const repositories = [mockRepository];
    render(
      <UserDropdown
        {...defaultProps}
        isExpanded={true}
        repositories={repositories}
      />
    );

    expect(screen.getByText("test-repo")).toBeInTheDocument();
    expect(screen.getByText("A test repository")).toBeInTheDocument();
  });

  it("does not show repository content when collapsed", () => {
    const repositories = [mockRepository];
    render(
      <UserDropdown
        {...defaultProps}
        isExpanded={false}
        repositories={repositories}
      />
    );

    expect(screen.queryByText("test-repo")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Loading repositories...")
    ).not.toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(<UserDropdown {...defaultProps} isExpanded={true} />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(button).toHaveAttribute("aria-controls", `repos-${mockUser.id}`);

    const repoSection = document.getElementById(`repos-${mockUser.id}`);
    expect(repoSection).toBeInTheDocument();
  });

  it("supports keyboard navigation", async () => {
    const user = userEvent.setup();
    render(<UserDropdown {...defaultProps} />);

    const button = screen.getByRole("button");

    await user.tab();
    expect(button).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(mockOnToggle).toHaveBeenCalledTimes(1);

    await user.keyboard(" ");
    expect(mockOnToggle).toHaveBeenCalledTimes(2);
  });

  it("shows empty state when no repositories and not loading", () => {
    render(
      <UserDropdown
        {...defaultProps}
        isExpanded={true}
        repositories={[]}
        isLoadingRepos={false}
        reposError={null}
      />
    );

    const repoSection = document.getElementById(`repos-${mockUser.id}`);
    expect(repoSection).toBeInTheDocument();
    expect(
      screen.queryByText("Loading repositories...")
    ).not.toBeInTheDocument();
  });

  it("handles multiple repositories correctly", () => {
    const multipleRepos = [
      mockRepository,
      {
        ...mockRepository,
        id: 2,
        name: "second-repo",
        description: "Second repository",
        stargazers_count: 20,
      },
    ];

    render(
      <UserDropdown
        {...defaultProps}
        isExpanded={true}
        repositories={multipleRepos}
      />
    );

    expect(screen.getByText("test-repo")).toBeInTheDocument();
    expect(screen.getByText("second-repo")).toBeInTheDocument();
    expect(screen.getByText("A test repository")).toBeInTheDocument();
    expect(screen.getByText("Second repository")).toBeInTheDocument();
  });

  it("maintains proper button state during loading", () => {
    render(
      <UserDropdown {...defaultProps} isExpanded={true} isLoadingRepos={true} />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(button).not.toBeDisabled();
  });

  it("handles rapid toggle clicks gracefully", async () => {
    const user = userEvent.setup();
    render(<UserDropdown {...defaultProps} />);

    const button = screen.getByRole("button");

    await user.click(button);
    await user.click(button);
    await user.click(button);

    expect(mockOnToggle).toHaveBeenCalledTimes(3);
  });
});
