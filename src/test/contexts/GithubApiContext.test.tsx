import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  renderHook,
  act,
  waitFor,
} from "@testing-library/react";
import { GithubApiProvider } from "../../contexts/GithubApiContext";
import { useGithubApi } from "../../hooks/useGithubApi";
import { mockUser, mockRepository } from "../test-utils";

// Properly mock the GitHub API service with controlled implementations
vi.mock("../../services/githubApi", () => ({
  GithubApiService: {
    searchUsers: vi.fn(),
    getUserRepositories: vi.fn(),
  },
}));

// Import the mocked service explicitly
import { GithubApiService } from "../../services/githubApi";

// Create a wrapper for tests
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <GithubApiProvider>{children}</GithubApiProvider>
);

// Helper test component that shows current state
const TestComponent = () => {
  const { state, setSearchQuery, fetchUsers, selectUser } = useGithubApi();

  return (
    <div>
      <div data-testid="searchQuery">{state.searchQuery}</div>
      <div data-testid="loading">
        {state.loadingUsers ? "Loading" : "Not Loading"}
      </div>
      <div data-testid="error">{state.error ?? "No Error"}</div>
      <div data-testid="userCount">{state.users.length}</div>
      <div data-testid="reposCount">{state.repos.length}</div>
      <button data-testid="setQuery" onClick={() => setSearchQuery("testuser")}>
        Set Query
      </button>
      <button data-testid="fetchUsers" onClick={() => fetchUsers("testuser")}>
        Fetch Users
      </button>
      <button data-testid="selectUser" onClick={() => selectUser(mockUser)}>
        Select User
      </button>
    </div>
  );
};

describe("GithubApiContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default successful mocks
    vi.mocked(GithubApiService.searchUsers).mockResolvedValue([mockUser]);
    vi.mocked(GithubApiService.getUserRepositories).mockResolvedValue([
      mockRepository,
    ]);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("provides initial context state", () => {
    const { result } = renderHook(() => useGithubApi(), { wrapper });

    expect(result.current.state).toEqual({
      searchQuery: "",
      users: [],
      selectedUser: null,
      repos: [],
      loadingUsers: false,
      loadingRepos: false,
      error: null,
      usersCache: expect.any(Map),
      reposCache: expect.any(Map),
    });
  });

  it("provides all required context methods", () => {
    const { result } = renderHook(() => useGithubApi(), { wrapper });

    expect(typeof result.current.fetchUsers).toBe("function");
    expect(typeof result.current.fetchRepos).toBe("function");
    expect(typeof result.current.selectUser).toBe("function");
    expect(typeof result.current.setSearchQuery).toBe("function");
    expect(typeof result.current.triggerSearch).toBe("function");
    expect(typeof result.current.clearSearch).toBe("function");
  });

  it("maintains state consistency across multiple consumers", async () => {
    // Render the test component
    render(
      <>
        <TestComponent />
        <TestComponent />
      </>,
      { wrapper }
    );

    // Get all buttons and trigger an action
    const setQueryButtons = screen.getAllByTestId("setQuery");
    await act(async () => {
      setQueryButtons[0].click();
    });

    // Check that both instances show the same state
    const searchQueries = screen.getAllByTestId("searchQuery");
    expect(searchQueries[0].textContent).toBe("testuser");
    expect(searchQueries[1].textContent).toBe("testuser");
  });

  it("handles reducer actions correctly", async () => {
    render(<TestComponent />, { wrapper });

    // Test SET_SEARCH_QUERY action
    const setQueryButton = screen.getByTestId("setQuery");
    await act(async () => {
      setQueryButton.click();
    });

    expect(screen.getByTestId("searchQuery").textContent).toBe("testuser");

    // Test selectUser action
    const selectUserButton = screen.getByTestId("selectUser");
    await act(async () => {
      selectUserButton.click();
    });

    // We can't easily test selectedUser directly through the DOM, but we could check
    // for side effects if needed. Here we just verify the action doesn't throw.
  });

  it("manages cache state properly", async () => {
    // Set up explicit mock implementation
    vi.mocked(GithubApiService.searchUsers).mockResolvedValue([mockUser]);

    const { result } = renderHook(() => useGithubApi(), { wrapper });

    // Trigger user search
    await act(async () => {
      result.current.fetchUsers("testuser");
    });

    // Wait for the cache to be updated
    await waitFor(() => {
      expect(result.current.state.usersCache.has("testuser")).toBe(true);
    });

    // Reset the mock and verify cache is used
    vi.mocked(GithubApiService.searchUsers).mockClear();

    // Call again, should use cache
    await act(async () => {
      result.current.fetchUsers("testuser");
    });

    // Should not have called the API again
    expect(GithubApiService.searchUsers).not.toHaveBeenCalled();

    // For repositories
    await act(async () => {
      result.current.fetchRepos("testuser");
    });

    // Wait for repo cache to be updated
    await waitFor(() => {
      expect(result.current.state.reposCache.has("testuser")).toBe(true);
    });
  });

  it("handles error states correctly", async () => {
    const errorMessage = "Test error";
    vi.mocked(GithubApiService.searchUsers).mockRejectedValue(
      new Error(errorMessage)
    );

    render(<TestComponent />, { wrapper });

    // Trigger the API call that will fail
    const fetchButton = screen.getByTestId("fetchUsers");
    await act(async () => {
      fetchButton.click();
    });

    // Check if the error is displayed
    await waitFor(() => {
      expect(screen.getByTestId("error").textContent).toBe(errorMessage);
    });
  });

  it("clears state correctly when clearSearch is called", async () => {
    const { result } = renderHook(() => useGithubApi(), { wrapper });

    // Set some state
    await act(async () => {
      result.current.setSearchQuery("testuser");
      result.current.selectUser(mockUser);
    });

    expect(result.current.state.searchQuery).toBe("testuser");
    expect(result.current.state.selectedUser).toEqual(mockUser);

    // Clear search
    await act(async () => {
      result.current.clearSearch();
    });

    expect(result.current.state.searchQuery).toBe("");
    expect(result.current.state.users).toEqual([]);
    expect(result.current.state.selectedUser).toBeNull();
    expect(result.current.state.error).toBeNull();
  });

  it("manages loading states correctly", async () => {
    // Create a controlled promise
    let resolveUsers: (value: (typeof mockUser)[]) => void;
    const userPromise = new Promise<(typeof mockUser)[]>((resolve) => {
      resolveUsers = resolve;
    });

    vi.mocked(GithubApiService.searchUsers).mockReturnValue(userPromise);

    render(<TestComponent />, { wrapper });

    // Start the fetch but don't resolve the promise yet
    const fetchButton = screen.getByTestId("fetchUsers");

    fetchButton.click();

    // Wait for the loading state to become true
    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("Loading");
    });

    // Now resolve the promise
    await act(async () => {
      resolveUsers!([mockUser]);
    });

    // After the promise resolves, loading should be false
    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("Not Loading");
    });
  });

  it("maintains referential stability of context methods", () => {
    const { result, rerender } = renderHook(() => useGithubApi(), { wrapper });

    const initialMethods = {
      fetchUsers: result.current.fetchUsers,
      fetchRepos: result.current.fetchRepos,
      selectUser: result.current.selectUser,
      setSearchQuery: result.current.setSearchQuery,
      triggerSearch: result.current.triggerSearch,
      clearSearch: result.current.clearSearch,
    };

    rerender();

    const newMethods = {
      fetchUsers: result.current.fetchUsers,
      fetchRepos: result.current.fetchRepos,
      selectUser: result.current.selectUser,
      setSearchQuery: result.current.setSearchQuery,
      triggerSearch: result.current.triggerSearch,
      clearSearch: result.current.clearSearch,
    };

    // Methods should maintain referential stability
    expect(initialMethods.fetchUsers).toBe(newMethods.fetchUsers);
    expect(initialMethods.fetchRepos).toBe(newMethods.fetchRepos);
    expect(initialMethods.selectUser).toBe(newMethods.selectUser);
    expect(initialMethods.setSearchQuery).toBe(newMethods.setSearchQuery);
    expect(initialMethods.triggerSearch).toBe(newMethods.triggerSearch);
    expect(initialMethods.clearSearch).toBe(newMethods.clearSearch);
  });
});
