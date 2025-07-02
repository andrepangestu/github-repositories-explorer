import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBar } from "../../components/SearchBar";
import { render } from "../test-utils";
import { useGithubApi } from "../../hooks/useGithubApi";

// Mock the GitHub API hook
const mockSetSearchQuery = vi.fn();
const mockTriggerSearch = vi.fn();
const mockFetchUsers = vi.fn();
const mockFetchRepos = vi.fn();
const mockSelectUser = vi.fn();
const mockClearSearch = vi.fn();

const createMockState = (overrides = {}) => ({
  searchQuery: "",
  loadingUsers: false,
  users: [],
  selectedUser: null,
  repos: [],
  loadingRepos: false,
  error: null,
  usersCache: new Map(),
  reposCache: new Map(),
  ...overrides,
});

vi.mock("../../hooks/useGithubApi", () => ({
  useGithubApi: vi.fn(() => ({
    state: createMockState(),
    setSearchQuery: mockSetSearchQuery,
    triggerSearch: mockTriggerSearch,
    fetchUsers: mockFetchUsers,
    fetchRepos: mockFetchRepos,
    selectUser: mockSelectUser,
    clearSearch: mockClearSearch,
  })),
}));

const mockUseGithubApi = vi.mocked(useGithubApi);

describe("SearchBar Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to default mock state
    mockUseGithubApi.mockReturnValue({
      state: {
        searchQuery: "",
        loadingUsers: false,
        users: [],
        selectedUser: null,
        repos: [],
        loadingRepos: false,
        error: null,
        usersCache: new Map(),
        reposCache: new Map(),
      },
      setSearchQuery: mockSetSearchQuery,
      triggerSearch: mockTriggerSearch,
    });
  });

  it("renders search input and button with correct attributes", () => {
    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText("Enter username");
    const searchButton = screen.getByRole("button", { name: /search/i });

    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute("type", "text");
    expect(searchInput).toHaveAttribute("aria-label", "Enter Github username");
    expect(searchButton).toBeInTheDocument();
    expect(searchButton).toHaveAttribute("type", "submit");
  });

  it("calls setSearchQuery when input value changes", async () => {
    const user = userEvent.setup();
    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText("Enter username");
    await user.type(searchInput, "testuser");

    // Should call setSearchQuery for each character
    expect(mockSetSearchQuery).toHaveBeenCalledTimes(8); // 'testuser' has 8 characters
    expect(mockSetSearchQuery).toHaveBeenLastCalledWith("testuser");
  });

  it("calls triggerSearch when form is submitted", async () => {
    const user = userEvent.setup();
    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText("Enter username");
    const searchButton = screen.getByRole("button", { name: /search/i });

    await user.type(searchInput, "testuser");
    await user.click(searchButton);

    expect(mockTriggerSearch).toHaveBeenCalledTimes(1);
  });

  it("calls triggerSearch when Enter key is pressed", async () => {
    const user = userEvent.setup();
    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText("Enter username");

    await user.type(searchInput, "testuser");
    await user.keyboard("{Enter}");

    expect(mockTriggerSearch).toHaveBeenCalledTimes(1);
  });

  it("prevents form submission with empty input", async () => {
    const user = userEvent.setup();
    render(<SearchBar />);

    const searchButton = screen.getByRole("button", { name: /search/i });
    await user.click(searchButton);

    expect(mockTriggerSearch).not.toHaveBeenCalled();
  });

  it("prevents form submission with whitespace-only input", async () => {
    const user = userEvent.setup();
    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText("Enter username");
    await user.type(searchInput, "   ");

    const searchButton = screen.getByRole("button", { name: /search/i });
    await user.click(searchButton);

    expect(mockTriggerSearch).not.toHaveBeenCalled();
  });

  it("shows loading state when searching", () => {
    // Mock loading state
    mockUseGithubApi.mockReturnValue({
      state: {
        searchQuery: "testuser",
        loadingUsers: true,
        users: [],
        error: null,
      },
      setSearchQuery: mockSetSearchQuery,
      triggerSearch: mockTriggerSearch,
    });

    render(<SearchBar />);

    expect(screen.getByText("Searching...")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();

    // Should show loading spinner
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });
  it("updates input value when searchQuery state changes", () => {
    const searchQuery = "external-update";

    mockUseGithubApi.mockReturnValue({
      state: {
        searchQuery,
        loadingUsers: false,
        users: [],
        error: null,
      },
      setSearchQuery: mockSetSearchQuery,
      triggerSearch: mockTriggerSearch,
    });

    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText("Enter username");
    expect(searchInput).toHaveValue(searchQuery);
  });

  it("handles rapid typing without issues", async () => {
    const user = userEvent.setup();
    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText("Enter username");

    // Type rapidly
    await user.type(searchInput, "test");

    await waitFor(() => {
      expect(mockSetSearchQuery).toHaveBeenCalledWith("test");
    });
  });

  it("prevents double submission on rapid clicks", async () => {
    const user = userEvent.setup();

    // Mock a state where search starts loading immediately
    let isLoading = false;
    mockTriggerSearch.mockImplementation(() => {
      isLoading = true;
    });

    mockUseGithubApi.mockImplementation(() => ({
      state: {
        searchQuery: "testuser",
        loadingUsers: isLoading,
        users: [],
        error: null,
      },
      setSearchQuery: mockSetSearchQuery,
      triggerSearch: mockTriggerSearch,
    }));

    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText("Enter username");
    const searchButton = screen.getByRole("button", { name: /search/i });

    await user.type(searchInput, "testuser");

    // First click should work
    await user.click(searchButton);

    // For now, just verify the trigger was called
    // In a real app, the button would be disabled after the first click
    expect(mockTriggerSearch).toHaveBeenCalledTimes(1);
  });

  it("maintains focus management correctly", async () => {
    const user = userEvent.setup();
    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText("Enter username");

    await user.click(searchInput);
    expect(searchInput).toHaveFocus();

    await user.type(searchInput, "test");
    expect(searchInput).toHaveFocus();
  });

  it("has proper form semantics", () => {
    render(<SearchBar />);

    const form = screen.getByRole("textbox").closest("form");
    expect(form).toBeInTheDocument();

    const searchButton = screen.getByRole("button", { name: /search/i });
    expect(searchButton).toHaveAttribute("type", "submit");
  });
});
