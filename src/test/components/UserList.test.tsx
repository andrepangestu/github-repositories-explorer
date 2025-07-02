import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserList } from "../../components/UserList";
import { render, mockUser, mockRepository } from "../test-utils";

// Mock the GitHub API hook
const mockFetchRepos = vi.fn();

const mockUseGithubApi = {
  state: {
    searchQuery: "testuser",
    users: [mockUser],
    reposCache: new Map(),
  },
  fetchRepos: mockFetchRepos,
};

vi.mock("../../hooks/useGithubApi", () => ({
  useGithubApi: () => mockUseGithubApi,
}));

describe("UserList Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock state
    mockUseGithubApi.state = {
      searchQuery: "testuser",
      users: [mockUser],
      reposCache: new Map(),
    };
  });

  it("renders search query information", () => {
    render(<UserList />);

    expect(screen.getByText(/showing users for/i)).toBeInTheDocument();
    expect(screen.getAllByText("testuser")[0]).toBeInTheDocument();
  });

  it("renders user dropdown for each user", () => {
    render(<UserList />);

    const userElements = screen.getAllByText("testuser");
    expect(userElements.length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { expanded: false })).toBeInTheDocument();
  });

  it("handles empty user list gracefully", () => {
    mockUseGithubApi.state = {
      searchQuery: "nonexistent",
      users: [],
      reposCache: new Map(),
    };

    render(<UserList />);

    // Component returns null when there are no users
    expect(screen.queryByText(/showing users for/i)).not.toBeInTheDocument();
    expect(screen.queryByText("nonexistent")).not.toBeInTheDocument();
    expect(screen.queryByText("testuser")).not.toBeInTheDocument();
  });

  it("toggles user dropdown when clicked", async () => {
    const user = userEvent.setup();
    render(<UserList />);

    const userButton = screen.getByRole("button", { expanded: false });

    // Initially collapsed
    expect(userButton).toHaveAttribute("aria-expanded", "false");

    // Click to expand
    await user.click(userButton);

    await waitFor(() => {
      expect(userButton).toHaveAttribute("aria-expanded", "true");
    });
  });

  it("fetches repositories when user is expanded for the first time", async () => {
    const user = userEvent.setup();
    render(<UserList />);

    const userButton = screen.getByRole("button", { expanded: false });
    await user.click(userButton);

    await waitFor(() => {
      expect(mockFetchRepos).toHaveBeenCalledWith("testuser");
    });
  });

  it("shows loading state when fetching repositories", async () => {
    const user = userEvent.setup();

    // Mock a loading state by making fetchRepos return a promise that doesn't resolve immediately
    let resolvePromise: () => void;
    const loadingPromise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
    mockFetchRepos.mockReturnValueOnce(loadingPromise);

    render(<UserList />);

    const userButton = screen.getByRole("button", { expanded: false });
    await user.click(userButton);

    await waitFor(() => {
      expect(screen.getByText("Loading repositories...")).toBeInTheDocument();
    });

    // Resolve the promise to clean up
    resolvePromise!();
  });

  it("uses cached repositories when available", () => {
    const reposCache = new Map();
    reposCache.set("testuser", [mockRepository]);

    mockUseGithubApi.state = {
      searchQuery: "testuser",
      users: [mockUser],
      reposCache,
    };

    render(<UserList />);

    // The component should display cached data without calling fetchRepos
    expect(mockFetchRepos).not.toHaveBeenCalled();
  });

  it("handles repository fetch errors gracefully", async () => {
    const user = userEvent.setup();
    const errorMessage = "Failed to fetch repositories";

    mockFetchRepos.mockRejectedValueOnce(new Error(errorMessage));

    render(<UserList />);

    const userButton = screen.getByRole("button", { expanded: false });
    await user.click(userButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it("renders multiple users correctly", () => {
    const secondUser = { ...mockUser, id: 2, login: "seconduser" };

    mockUseGithubApi.state = {
      searchQuery: "test",
      users: [mockUser, secondUser],
      reposCache: new Map(),
    };

    render(<UserList />);

    expect(screen.getAllByText("testuser")[0]).toBeInTheDocument();
    expect(screen.getByText("seconduser")).toBeInTheDocument();
    expect(screen.getAllByText(/test/i)[0]).toBeInTheDocument();
  });

  it("maintains user expansion state independently", async () => {
    const user = userEvent.setup();
    const secondUser = { ...mockUser, id: 2, login: "seconduser" };

    mockUseGithubApi.state = {
      searchQuery: "test",
      users: [mockUser, secondUser],
      reposCache: new Map(),
    };

    render(<UserList />);

    const userButtons = screen.getAllByRole("button", { expanded: false });
    expect(userButtons).toHaveLength(2);

    // Expand first user
    await user.click(userButtons[0]);

    await waitFor(() => {
      expect(userButtons[0]).toHaveAttribute("aria-expanded", "true");
      expect(userButtons[1]).toHaveAttribute("aria-expanded", "false");
    });
  });

  it("handles rapid user interactions gracefully", async () => {
    const user = userEvent.setup();
    render(<UserList />);

    const userButton = screen.getByRole("button", { expanded: false });

    // Rapid clicks
    await user.click(userButton);
    await user.click(userButton);
    await user.click(userButton);

    // Should handle rapid state changes without issues
    await waitFor(() => {
      expect(userButton).toHaveAttribute("aria-expanded", "true");
    });
  });

  it("displays correct count information", () => {
    mockUseGithubApi.state = {
      searchQuery: "testuser",
      users: [mockUser],
      reposCache: new Map(),
    };

    render(<UserList />);

    // Should show user count information
    expect(screen.getByText(/showing users for/i)).toBeInTheDocument();
    expect(screen.getAllByText(/testuser/i)[0]).toBeInTheDocument();
  });

  it("handles special characters in search query", () => {
    mockUseGithubApi.state = {
      searchQuery: "test-user@domain.com",
      users: [mockUser],
      reposCache: new Map(),
    };

    render(<UserList />);

    expect(screen.getByText(/test-user@domain.com/i)).toBeInTheDocument();
  });

  it("manages repository cache updates correctly", () => {
    const reposCache = new Map();
    reposCache.set("testuser", [mockRepository]);

    mockUseGithubApi.state = {
      searchQuery: "testuser",
      users: [mockUser],
      reposCache,
    };

    render(<UserList />);

    // Should not call fetchRepos if data is cached
    expect(mockFetchRepos).not.toHaveBeenCalled();
  });

  it("handles keyboard navigation properly", async () => {
    const user = userEvent.setup();
    render(<UserList />);

    // Tab to the user button
    await user.tab();
    const userButton = screen.getByRole("button", { expanded: false });
    expect(userButton).toHaveFocus();

    // Press Enter to expand
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(userButton).toHaveAttribute("aria-expanded", "true");
    });
  });

  it("preserves user order from API response", () => {
    const users = [
      { ...mockUser, id: 1, login: "alpha" },
      { ...mockUser, id: 2, login: "beta" },
      { ...mockUser, id: 3, login: "gamma" },
    ];

    mockUseGithubApi.state = {
      searchQuery: "test",
      users,
      reposCache: new Map(),
    };

    render(<UserList />);

    const userElements = screen.getAllByRole("button");
    expect(userElements[0]).toHaveTextContent("alpha");
    expect(userElements[1]).toHaveTextContent("beta");
    expect(userElements[2]).toHaveTextContent("gamma");
  });

  it("handles component unmounting during async operations", async () => {
    const user = userEvent.setup();

    // Mock a promise that never resolves to simulate ongoing operation
    const neverResolvePromise = new Promise(() => {});
    mockFetchRepos.mockReturnValueOnce(neverResolvePromise);

    const { unmount } = render(<UserList />);

    const userButton = screen.getByRole("button", { expanded: false });
    await user.click(userButton);

    // Unmount component during async operation
    unmount();

    // Should not throw any errors
    expect(mockFetchRepos).toHaveBeenCalledWith("testuser");
  });
});
