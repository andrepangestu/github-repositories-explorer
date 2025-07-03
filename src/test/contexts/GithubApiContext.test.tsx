import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  renderHook,
  act,
  waitFor,
} from "@testing-library/react";
import { useGithubApi } from "../../hooks/useGithubApi";
import { mockUser, mockRepository } from "../test-utils";
import { GithubApiService } from "../../services/githubApi";
import { GithubApiProvider } from "../../contexts/GithubApiContext";

vi.mock("../../services/githubApi", () => ({
  GithubApiService: {
    searchUsers: vi.fn(),
    getUserRepositories: vi.fn(),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <GithubApiProvider>{children}</GithubApiProvider>
);

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
    render(
      <>
        <TestComponent />
        <TestComponent />
      </>,
      { wrapper }
    );

    const setQueryButtons = screen.getAllByTestId("setQuery");
    await act(async () => {
      setQueryButtons[0].click();
    });

    const searchQueries = screen.getAllByTestId("searchQuery");
    expect(searchQueries[0].textContent).toBe("testuser");
    expect(searchQueries[1].textContent).toBe("testuser");
  });

  it("handles reducer actions correctly", async () => {
    render(<TestComponent />, { wrapper });

    const setQueryButton = screen.getByTestId("setQuery");
    await act(async () => {
      setQueryButton.click();
    });

    expect(screen.getByTestId("searchQuery").textContent).toBe("testuser");

    const selectUserButton = screen.getByTestId("selectUser");
    await act(async () => {
      selectUserButton.click();
    });
  });

  it("manages cache state properly", async () => {
    vi.mocked(GithubApiService.searchUsers).mockResolvedValue([mockUser]);

    const { result } = renderHook(() => useGithubApi(), { wrapper });

    await act(async () => {
      result.current.fetchUsers("testuser");
    });

    await waitFor(() => {
      expect(result.current.state.usersCache.has("testuser")).toBe(true);
    });

    vi.mocked(GithubApiService.searchUsers).mockClear();

    await act(async () => {
      result.current.fetchUsers("testuser");
    });

    expect(GithubApiService.searchUsers).not.toHaveBeenCalled();

    await act(async () => {
      result.current.fetchRepos("testuser");
    });

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

    const fetchButton = screen.getByTestId("fetchUsers");
    await act(async () => {
      fetchButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("error").textContent).toBe(errorMessage);
    });
  });

  it("clears state correctly when clearSearch is called", async () => {
    const { result } = renderHook(() => useGithubApi(), { wrapper });

    await act(async () => {
      result.current.setSearchQuery("testuser");
      result.current.selectUser(mockUser);
    });

    expect(result.current.state.searchQuery).toBe("testuser");
    expect(result.current.state.selectedUser).toEqual(mockUser);

    await act(async () => {
      result.current.clearSearch();
    });

    expect(result.current.state.searchQuery).toBe("");
    expect(result.current.state.users).toEqual([]);
    expect(result.current.state.selectedUser).toBeNull();
    expect(result.current.state.error).toBeNull();
  });

  it("manages loading states correctly", async () => {
    let resolveUsers: (value: (typeof mockUser)[]) => void;
    const userPromise = new Promise<(typeof mockUser)[]>((resolve) => {
      resolveUsers = resolve;
    });

    vi.mocked(GithubApiService.searchUsers).mockReturnValue(userPromise);

    render(<TestComponent />, { wrapper });

    const fetchButton = screen.getByTestId("fetchUsers");

    fetchButton.click();

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("Loading");
    });

    await act(async () => {
      resolveUsers!([mockUser]);
    });

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

    expect(initialMethods.fetchUsers).toBe(newMethods.fetchUsers);
    expect(initialMethods.fetchRepos).toBe(newMethods.fetchRepos);
    expect(initialMethods.selectUser).toBe(newMethods.selectUser);
    expect(initialMethods.setSearchQuery).toBe(newMethods.setSearchQuery);
    expect(initialMethods.triggerSearch).toBe(newMethods.triggerSearch);
    expect(initialMethods.clearSearch).toBe(newMethods.clearSearch);
  });
});
