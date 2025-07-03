import {
  screen,
  waitFor,
  fireEvent,
  act,
  within,
  prettyDOM,
  queries,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { vi, expect } from "vitest";
import type {
  GithubUser,
  GithubRepository,
  SearchUsersResponse,
} from "../types/github";
import { render } from "./custom-render";

// =============================================================================
// Test Utilities and Setup
// =============================================================================

export { render, screen, waitFor, fireEvent, act, within, prettyDOM, queries };
export { mockAxiosInstance } from "./setup";

// =============================================================================
// User Event Setup
// =============================================================================

export const createUser = () => userEvent.setup();

// =============================================================================
// Mock Data Factories
// =============================================================================

export const createMockUser = (
  overrides?: Partial<GithubUser>
): GithubUser => ({
  id: 1,
  login: "testuser",
  avatar_url: "https://avatar.githubusercontent.com/u/1?v=4",
  html_url: "https://github.com/testuser",
  type: "User",
  name: "Test User",
  bio: "A test user for testing purposes",
  location: "Test City",
  public_repos: 10,
  followers: 100,
  following: 50,
  created_at: "2020-01-01T00:00:00Z",
  ...overrides,
});

export const createMockRepository = (
  overrides?: Partial<GithubRepository>
): GithubRepository => ({
  id: 1,
  name: "test-repo",
  full_name: "testuser/test-repo",
  description: "A test repository",
  html_url: "https://github.com/testuser/test-repo",
  stargazers_count: 100,
  watchers_count: 50,
  forks_count: 25,
  language: "TypeScript",
  updated_at: "2023-01-01T00:00:00Z",
  created_at: "2022-01-01T00:00:00Z",
  topics: ["test", "javascript"],
  visibility: "public",
  default_branch: "main",
  ...overrides,
});

export const createMockSearchResponse = (
  users: GithubUser[] = [createMockUser()],
  overrides?: Partial<SearchUsersResponse>
): SearchUsersResponse => ({
  total_count: users.length,
  incomplete_results: false,
  items: users,
  ...overrides,
});

// =============================================================================
// Mock Multiple Items
// =============================================================================

export const createMockUsers = (count: number): GithubUser[] =>
  Array.from({ length: count }, (_, index) =>
    createMockUser({
      id: index + 1,
      login: `testuser${index + 1}`,
      name: `Test User ${index + 1}`,
      html_url: `https://github.com/testuser${index + 1}`,
      public_repos: Math.floor(Math.random() * 100),
      followers: Math.floor(Math.random() * 1000),
      following: Math.floor(Math.random() * 100),
    })
  );

export const createMockRepositories = (
  count: number,
  username: string = "testuser"
): GithubRepository[] =>
  Array.from({ length: count }, (_, index) =>
    createMockRepository({
      id: index + 1,
      name: `repo-${index + 1}`,
      full_name: `${username}/repo-${index + 1}`,
      description: `Test repository ${index + 1}`,
      html_url: `https://github.com/${username}/repo-${index + 1}`,
      stargazers_count: Math.floor(Math.random() * 1000),
      language: ["TypeScript", "JavaScript", "Python", "Java", null][
        Math.floor(Math.random() * 5)
      ],
    })
  );

// =============================================================================
// Mock API Responses
// =============================================================================

export const mockSuccessfulUserSearch = (
  users: GithubUser[] = [createMockUser()]
) => {
  // Use the existing axios mock from setup.ts
  return { users, response: createMockSearchResponse(users) };
};

export const mockSuccessfulRepositoryFetch = (
  repos: GithubRepository[] = [createMockRepository()]
) => {
  return { repos };
};

export const mockApiError = (status: number, message: string) => {
  const error = new Error(message) as Error & {
    response?: { status: number; data: { message: string } };
    isAxiosError?: boolean;
  };
  error.response = { status, data: { message } };
  error.isAxiosError = true;
  return error;
};

export const mockNetworkError = () => {
  const error = new Error("Network Error");
  return error;
};

// =============================================================================
// Test Helpers
// =============================================================================

export const waitForLoadingToFinish = () =>
  waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

export const expectElementToBeVisible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
};

export const expectElementNotToBeInDocument = (selector: string) => {
  expect(screen.queryByText(selector)).not.toBeInTheDocument();
};

// =============================================================================
// Accessibility Helpers
// =============================================================================

export const expectProperAriaAttributes = (
  button: HTMLElement,
  expanded: boolean
) => {
  expect(button).toHaveAttribute("aria-expanded", expanded.toString());
  if (expanded) {
    expect(button).toHaveAttribute("aria-controls");
  }
};

// =============================================================================
// Form Test Helpers
// =============================================================================

export const typeIntoSearchInput = async (
  user: ReturnType<typeof createUser>,
  text: string
) => {
  const input = screen.getByRole("textbox", { name: /github username/i });
  await user.clear(input);
  await user.type(input, text);
  return input;
};

export const submitSearchForm = async (user: ReturnType<typeof createUser>) => {
  const submitButton = screen.getByRole("button", { name: /search/i });
  await user.click(submitButton);
  return submitButton;
};

// =============================================================================
// Mock Constants for Testing
// =============================================================================

export const MOCK_USERS = createMockUsers(3);
export const MOCK_REPOSITORIES = createMockRepositories(5);
export const MOCK_USER = createMockUser();
export const MOCK_REPOSITORY = createMockRepository();

// Legacy exports for backward compatibility
export const mockUser = createMockUser();
export const mockRepository = createMockRepository();

// =============================================================================
// Edge Case Data
// =============================================================================

export const createMockUserWithNoRepos = (): GithubUser =>
  createMockUser({
    id: 999,
    login: "emptytestuser",
    name: "Empty Test User",
    public_repos: 0,
  });

export const createMockRepoWithNoDescription = (): GithubRepository =>
  createMockRepository({
    id: 999,
    name: "no-description-repo",
    description: null,
  });

export const createMockRepoWithHighStars = (): GithubRepository =>
  createMockRepository({
    id: 1000,
    name: "popular-repo",
    stargazers_count: 2500000,
  });

// =============================================================================
// Async Test Utilities
// =============================================================================

export const flushPromises = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

export const advanceTimersByTime = (ms: number) => {
  vi.advanceTimersByTime(ms);
  return flushPromises();
};
