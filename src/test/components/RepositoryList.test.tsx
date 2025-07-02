import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RepositoryList } from "../../components/RepositoryList";
import { render, mockRepository } from "../test-utils";

// Import the formatNumber function directly from the RepositoryList component
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

// Mock window.open
const mockWindowOpen = vi.fn();
Object.defineProperty(window, "open", {
  writable: true,
  value: mockWindowOpen,
});

describe("RepositoryList Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state when no repositories provided", () => {
    render(<RepositoryList repositories={[]} />);

    const container = document.querySelector('[data-testid="repository-list"]');
    expect(container).toBeInTheDocument();
    expect(container?.tagName.toLowerCase()).toBe("ul");
  });

  it("renders repository information correctly", () => {
    const repositories = [mockRepository];
    render(<RepositoryList repositories={repositories} />);

    expect(screen.getByText("test-repo")).toBeInTheDocument();
    expect(screen.getByText("A test repository")).toBeInTheDocument();

    // Testing for the star count
    const starCountEl = screen.getByText(
      formatNumber(mockRepository.stargazers_count)
    );
    expect(starCountEl).toBeInTheDocument();

    // Check for star icon
    const starIcon =
      document.querySelector('[data-testid="star-icon"]') ||
      document.querySelector(".fill-current");
    expect(starIcon).toBeInTheDocument();
  });

  it("opens repository in new tab when repository name is clicked", async () => {
    const user = userEvent.setup();
    const repositories = [mockRepository];
    render(<RepositoryList repositories={repositories} />);

    const repoButton = screen.getByText("test-repo");
    expect(repoButton).toHaveAttribute("title", "Open test-repo on GitHub");

    await user.click(repoButton);

    expect(mockWindowOpen).toHaveBeenCalledWith(
      mockRepository.html_url,
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("formats star counts correctly for numbers less than 1000", () => {
    const repo = {
      ...mockRepository,
      stargazers_count: 500,
    };
    render(<RepositoryList repositories={[repo]} />);

    expect(screen.getByText("500")).toBeInTheDocument();
  });

  it("formats star counts correctly for thousands", () => {
    const repoWithManyStars = {
      ...mockRepository,
      stargazers_count: 1500,
    };
    render(<RepositoryList repositories={[repoWithManyStars]} />);

    expect(screen.getByText("1.5k")).toBeInTheDocument();
  });

  it("formats star counts correctly for millions", () => {
    const repoWithMillionStars = {
      ...mockRepository,
      stargazers_count: 2500000,
    };
    render(<RepositoryList repositories={[repoWithMillionStars]} />);

    expect(screen.getByText("2.5M")).toBeInTheDocument();
  });

  it("handles edge cases in star count formatting", () => {
    const testCases = [
      { count: 0, expected: "0" },
      { count: 999, expected: "999" },
      { count: 1000, expected: "1.0k" },
      { count: 1200, expected: "1.2k" },
      { count: 999999, expected: "1000.0k" },
      { count: 1000000, expected: "1.0M" },
      { count: 1500000, expected: "1.5M" },
    ];

    testCases.forEach(({ count, expected }) => {
      const repo = {
        ...mockRepository,
        id: count, // Unique id for each test
        name: `repo-${count}`,
        stargazers_count: count,
      };

      render(<RepositoryList repositories={[repo]} />);
      expect(screen.getByText(expected)).toBeInTheDocument();
    });
  });

  it("renders multiple repositories correctly", () => {
    const repositories = [
      mockRepository,
      {
        ...mockRepository,
        id: 2,
        name: "second-repo",
        description: "Second repository",
        stargazers_count: 20,
      },
      {
        ...mockRepository,
        id: 3,
        name: "third-repo",
        description: "Third repository",
        stargazers_count: 30,
      },
    ];
    render(<RepositoryList repositories={repositories} />);

    expect(screen.getByText("test-repo")).toBeInTheDocument();
    expect(screen.getByText("second-repo")).toBeInTheDocument();
    expect(screen.getByText("third-repo")).toBeInTheDocument();
    expect(screen.getByText("A test repository")).toBeInTheDocument();
    expect(screen.getByText("Second repository")).toBeInTheDocument();
    expect(screen.getByText("Third repository")).toBeInTheDocument();

    // Check that all star counts are displayed
    expect(
      screen.getByText(formatNumber(mockRepository.stargazers_count))
    ).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
  });

  it("handles repository without description gracefully", () => {
    const repoWithoutDescription = {
      ...mockRepository,
      description: null,
    };
    render(<RepositoryList repositories={[repoWithoutDescription]} />);

    expect(screen.getByText("test-repo")).toBeInTheDocument();
    expect(screen.queryByText("A test repository")).not.toBeInTheDocument();

    // Stars still shown
    expect(
      screen.getByText(formatNumber(mockRepository.stargazers_count))
    ).toBeInTheDocument();
  });

  it("handles repository with empty description", () => {
    const repoWithEmptyDescription = {
      ...mockRepository,
      description: "",
    };
    render(<RepositoryList repositories={[repoWithEmptyDescription]} />);

    expect(screen.getByText("test-repo")).toBeInTheDocument();
    expect(screen.queryByText("A test repository")).not.toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    const repositories = [mockRepository];
    render(<RepositoryList repositories={repositories} />);

    const repoButton = screen.getByText("test-repo");
    expect(repoButton).toHaveAttribute("title", "Open test-repo on GitHub");
    expect(repoButton).toHaveAttribute("type", "button");
    expect(repoButton).toHaveAttribute(
      "aria-label",
      "Open test-repo on GitHub"
    );
  });

  it("supports keyboard navigation for repository links", async () => {
    const user = userEvent.setup();
    const repositories = [mockRepository];
    render(<RepositoryList repositories={repositories} />);

    const repoButton =
      screen.getByRole("button", { name: /open test-repo on github/i }) ||
      screen.getByText("test-repo");

    // Tab to the repository button
    await user.tab();
    expect(repoButton).toHaveFocus();

    // Press Enter to open
    await user.keyboard("{Enter}");
    expect(mockWindowOpen).toHaveBeenCalledWith(
      mockRepository.html_url,
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("handles rapid clicks on repository links", async () => {
    const user = userEvent.setup();
    const repositories = [mockRepository];
    render(<RepositoryList repositories={repositories} />);

    const repoButton =
      screen.getByRole("button", { name: /open test-repo on github/i }) ||
      screen.getByText("test-repo");

    // Rapid clicks
    await user.click(repoButton);
    await user.click(repoButton);
    await user.click(repoButton);

    expect(mockWindowOpen).toHaveBeenCalledTimes(3);
  });

  it("maintains proper styling for different repository states", () => {
    const repositories = [
      mockRepository,
      {
        ...mockRepository,
        id: 2,
        name: "archived-repo",
        description: "This is an archived repository",
        stargazers_count: 0,
      },
    ];
    render(<RepositoryList repositories={repositories} />);

    // Check that all repositories are rendered with consistent styling
    const repoContainers = document.querySelectorAll(".bg-gray-50");
    expect(repoContainers).toHaveLength(2);

    // Check that star counts are properly displayed even for zero stars
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("handles long repository descriptions appropriately", () => {
    const repoWithLongDescription = {
      ...mockRepository,
      description:
        "This is a very long repository description that might wrap to multiple lines and should be handled gracefully by the component layout and styling without breaking the design",
    };
    render(<RepositoryList repositories={[repoWithLongDescription]} />);

    expect(screen.getByText("test-repo")).toBeInTheDocument();
    expect(
      screen.getByText(repoWithLongDescription.description)
    ).toBeInTheDocument();
  });

  it("handles repository names with special characters", () => {
    const repoWithSpecialName = {
      ...mockRepository,
      name: "test-repo.js",
      html_url: "https://github.com/testuser/test-repo.js",
    };
    render(<RepositoryList repositories={[repoWithSpecialName]} />);

    expect(screen.getByText("test-repo.js")).toBeInTheDocument();

    // Should still be clickable
    const repoButton =
      screen.getByRole("button", { name: /open test-repo\.js on github/i }) ||
      screen.getByText("test-repo.js");
    expect(repoButton).toBeInTheDocument();
  });
});
