import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../App";
import { render, mockUser, mockRepository } from "../test-utils";
import type { GithubUser } from "../../types/github";

vi.mock("../../services/githubApi", () => ({
  GithubApiService: {
    searchUsers: vi.fn(),
    getUserRepositories: vi.fn(),
  },
}));

describe("App Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {});

  it("renders the application with search interface", () => {
    render(<App />);

    expect(screen.getByPlaceholderText("Enter username")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  it("allows typing in search input", async () => {
    const user = userEvent.setup();
    render(<App />);

    const searchInput = screen.getByPlaceholderText("Enter username");
    await user.type(searchInput, "testuser");

    expect(searchInput).toHaveValue("testuser");
  });

  it("prevents submission of empty search", async () => {
    const user = userEvent.setup();
    render(<App />);

    const searchButton = screen.getByRole("button", { name: /search/i });
    await user.click(searchButton);

    expect(screen.queryByText(/showing users for/i)).not.toBeInTheDocument();
  });

  it("performs complete user search and repository exploration flow", async () => {
    const user = userEvent.setup();
    const { GithubApiService } = await import("../../services/githubApi");

    vi.mocked(GithubApiService.searchUsers).mockResolvedValueOnce([mockUser]);
    vi.mocked(GithubApiService.getUserRepositories).mockResolvedValueOnce([
      mockRepository,
    ]);

    render(<App />);

    const searchInput = screen.getByPlaceholderText("Enter username");
    await user.type(searchInput, "testuser");

    const searchButton = screen.getByRole("button", { name: /search/i });
    await user.click(searchButton);

    await waitFor(
      () => {
        expect(screen.getByText(/showing users for/i)).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    vi.mocked(GithubApiService.getUserRepositories).mockResolvedValueOnce([
      {
        id: 1,
        name: "test-repo",
        full_name: "testuser/test-repo",
        description: "A test repository",
        html_url: "https://github.com/testuser/test-repo",
        stargazers_count: 100,
        watchers_count: 50,
        forks_count: 10,
        language: "TypeScript",
        updated_at: "2023-01-01T00:00:00Z",
        created_at: "2022-01-01T00:00:00Z",
        topics: ["react", "typescript"],
        visibility: "public",
        default_branch: "main",
      },
    ]);

    await waitFor(() => {
      expect(screen.getAllByText("testuser").length).toBeGreaterThan(0);
    });

    const userButtons = screen.getAllByText("testuser");
    const userButton = userButtons
      .find((el) =>
        el.closest("button")?.getAttribute("aria-controls")?.startsWith("repos")
      )
      ?.closest("button");

    expect(userButton).not.toBeUndefined();
    await user.click(userButton!);

    await waitFor(() => {
      expect(screen.getByText("test-repo")).toBeInTheDocument();
      expect(screen.getByText("A test repository")).toBeInTheDocument();
      expect(screen.getByText("100")).toBeInTheDocument();
    });
  });

  it("displays error messages appropriately", async () => {
    const user = userEvent.setup();
    const { GithubApiService } = await import("../../services/githubApi");
    const errorMessage = "User not found";

    vi.mocked(GithubApiService.searchUsers).mockRejectedValueOnce(
      new Error(errorMessage)
    );

    render(<App />);

    const searchInput = screen.getByPlaceholderText("Enter username");
    await user.type(searchInput, "nonexistent");

    const searchButton = screen.getByRole("button", { name: /search/i });
    await user.click(searchButton);

    await waitFor(
      () => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it("shows loading state during search", async () => {
    const user = userEvent.setup();
    const { GithubApiService } = await import("../../services/githubApi");

    let resolvePromise: ((users: (typeof mockUser)[]) => void) | null = null;
    const delayedPromise = new Promise<(typeof mockUser)[]>((resolve) => {
      resolvePromise = resolve;
    });

    vi.mocked(GithubApiService.searchUsers).mockReturnValueOnce(delayedPromise);

    render(<App />);

    const searchInput = screen.getByPlaceholderText("Enter username");
    await user.type(searchInput, "testuser");

    const searchButton = screen.getByRole("button", { name: /search/i });
    await user.click(searchButton);

    await waitFor(
      () => {
        const spinner = document.querySelector(".animate-spin");
        expect(spinner).not.toBeNull();
      },
      { timeout: 1000 }
    );

    resolvePromise!([mockUser]);

    await waitFor(() => {
      expect(screen.queryByText("Searching...")).not.toBeInTheDocument();
    });
  });

  it("handles empty search results gracefully", async () => {
    const user = userEvent.setup();
    const { GithubApiService } = await import("../../services/githubApi");

    vi.mocked(GithubApiService.searchUsers).mockResolvedValueOnce([]);

    render(<App />);

    const searchInput = screen.getByPlaceholderText("Enter username");
    await user.type(searchInput, "nonexistentuser");

    const searchButton = screen.getByRole("button", { name: /search/i });
    await user.click(searchButton);

    await waitFor(
      () => {
        expect(screen.queryByText("Searching...")).not.toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    expect(screen.queryByText(/showing users for/i)).not.toBeInTheDocument();
  });

  it("maintains search state across user interactions", async () => {
    const user = userEvent.setup();
    const mockUser: GithubUser = {
      id: 123,
      login: "testuser",
      avatar_url: "https://example.com/avatar.png",
      html_url: "https://example.com/user",
      type: "User",
      public_repos: 10,
      followers: 100,
      following: 50,
      created_at: "2022-01-01T00:00:00Z",
      name: "Test User",
      bio: "Test bio",
      location: "Test location",
    };

    const { GithubApiService } = await import("../../services/githubApi");

    vi.mocked(GithubApiService.searchUsers).mockResolvedValueOnce([mockUser]);

    render(<App />);

    const searchInput = screen.getByPlaceholderText("Enter username");
    await user.type(searchInput, "testuser");

    const searchButton = screen.getByRole("button", { name: /search/i });
    await user.click(searchButton);

    await waitFor(
      () => {
        expect(screen.getByText(/showing users for/i)).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    expect(searchInput).toHaveValue("testuser");

    expect(
      screen.getByRole("button", { name: /testuser/i })
    ).toBeInTheDocument();
  });
});
