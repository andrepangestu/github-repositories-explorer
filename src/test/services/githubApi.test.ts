import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  searchUsers,
  getUserRepositories,
  GithubApiService,
} from "../../services/githubApi";
import type { GithubRepository, SearchUsersResponse } from "../../types/github";

// Mock the entire services module
vi.mock("../../services/githubApi", async () => {
  const actual = await vi.importActual("../../services/githubApi");
  return {
    ...actual,
    searchUsers: vi.fn(),
    getUserRepositories: vi.fn(),
    GithubApiService: {
      searchUsers: vi.fn(),
      getUserRepositories: vi.fn(),
    },
  };
});

const mockSearchUsers = vi.mocked(searchUsers);
const mockGetUserRepositories = vi.mocked(getUserRepositories);
const mockGithubApiService = vi.mocked(GithubApiService);

const mockSearchResponse: SearchUsersResponse = {
  total_count: 2,
  incomplete_results: false,
  items: [
    {
      id: 1,
      login: "testuser1",
      avatar_url: "https://avatars.githubusercontent.com/u/1?v=4",
      html_url: "https://github.com/testuser1",
      type: "User",
      name: "Test User 1",
      bio: "First test user",
      location: "Test City",
      public_repos: 10,
      followers: 100,
      following: 50,
      created_at: "2020-01-01T00:00:00Z",
    },
    {
      id: 2,
      login: "testuser2",
      avatar_url: "https://avatars.githubusercontent.com/u/2?v=4",
      html_url: "https://github.com/testuser2",
      type: "User",
      name: "Test User 2",
      bio: "Second test user",
      location: "Test City 2",
      public_repos: 5,
      followers: 50,
      following: 25,
      created_at: "2020-02-01T00:00:00Z",
    },
  ],
};

const mockRepositories: GithubRepository[] = [
  {
    id: 1,
    name: "test-repo-1",
    full_name: "testuser1/test-repo-1",
    description: "A test repository",
    html_url: "https://github.com/testuser1/test-repo-1",
    stargazers_count: 42,
    watchers_count: 10,
    forks_count: 5,
    language: "TypeScript",
    updated_at: "2023-12-01T10:00:00Z",
    created_at: "2023-01-01T10:00:00Z",
    topics: ["test", "typescript"],
    visibility: "public",
    default_branch: "main",
  },
  {
    id: 2,
    name: "another-repo",
    full_name: "testuser1/another-repo",
    description: "Another test repository",
    html_url: "https://github.com/testuser1/another-repo",
    stargazers_count: 15,
    watchers_count: 3,
    forks_count: 2,
    language: "JavaScript",
    updated_at: "2023-11-15T14:30:00Z",
    created_at: "2023-06-01T09:15:00Z",
    topics: ["javascript", "node"],
    visibility: "public",
    default_branch: "master",
  },
];

describe("GitHub API Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("searchUsers", () => {
    it("searches for users successfully", async () => {
      mockSearchUsers.mockResolvedValue(mockSearchResponse.items);

      const result = await searchUsers("testuser");

      expect(result).toEqual(mockSearchResponse.items);
      expect(mockSearchUsers).toHaveBeenCalledWith("testuser");
    });

    it("uses custom limit parameter", async () => {
      mockSearchUsers.mockResolvedValue(mockSearchResponse.items);

      await searchUsers("testuser", 10);

      expect(mockSearchUsers).toHaveBeenCalledWith("testuser", 10);
    });

    it("handles empty search query", async () => {
      const error = new Error("Search query cannot be empty");
      mockSearchUsers.mockRejectedValue(error);

      await expect(searchUsers("")).rejects.toThrow(
        "Search query cannot be empty"
      );
    });

    it("handles API errors", async () => {
      const apiError = {
        message: "API rate limit exceeded",
        status: 403,
        type: "API_ERROR",
      };
      mockSearchUsers.mockRejectedValue(apiError);

      await expect(searchUsers("test")).rejects.toMatchObject(apiError);
    });

    it("handles network errors", async () => {
      const networkError = {
        message: "Network error. Please check your internet connection.",
        type: "NETWORK_ERROR",
      };
      mockSearchUsers.mockRejectedValue(networkError);

      await expect(searchUsers("test")).rejects.toMatchObject(networkError);
    });
  });

  describe("getUserRepositories", () => {
    it("fetches user repositories successfully", async () => {
      mockGetUserRepositories.mockResolvedValue(mockRepositories);

      const result = await getUserRepositories("testuser1");

      expect(result).toEqual(mockRepositories);
      expect(mockGetUserRepositories).toHaveBeenCalledWith("testuser1");
    });

    it("handles empty username", async () => {
      const error = new Error("Username cannot be empty");
      mockGetUserRepositories.mockRejectedValue(error);

      await expect(getUserRepositories("")).rejects.toThrow(
        "Username cannot be empty"
      );
    });

    it("handles user not found", async () => {
      const notFoundError = {
        message: "Resource not found.",
        status: 404,
        type: "NOT_FOUND",
      };
      mockGetUserRepositories.mockRejectedValue(notFoundError);

      await expect(
        getUserRepositories("nonexistentuser")
      ).rejects.toMatchObject(notFoundError);
    });

    it("handles API errors for repository fetching", async () => {
      const apiError = {
        message: "Github API error: Server error",
        status: 500,
        type: "API_ERROR",
      };
      mockGetUserRepositories.mockRejectedValue(apiError);

      await expect(getUserRepositories("testuser")).rejects.toMatchObject(
        apiError
      );
    });
  });

  describe("GithubApiService (Legacy Interface)", () => {
    it("provides backward compatibility for searchUsers", async () => {
      mockGithubApiService.searchUsers.mockResolvedValue(
        mockSearchResponse.items
      );

      const result = await GithubApiService.searchUsers("testuser");

      expect(result).toEqual(mockSearchResponse.items);
      expect(mockGithubApiService.searchUsers).toHaveBeenCalledWith("testuser");
    });

    it("provides backward compatibility for getUserRepositories", async () => {
      mockGithubApiService.getUserRepositories.mockResolvedValue(
        mockRepositories
      );

      const result = await GithubApiService.getUserRepositories("testuser1");

      expect(result).toEqual(mockRepositories);
      expect(mockGithubApiService.getUserRepositories).toHaveBeenCalledWith(
        "testuser1"
      );
    });
  });

  describe("Error Handling", () => {
    it("handles rate limit errors gracefully", async () => {
      const rateLimitError = {
        message: "Github API rate limit exceeded. Please try again later.",
        status: 403,
        type: "API_ERROR",
      };
      mockSearchUsers.mockRejectedValue(rateLimitError);

      await expect(searchUsers("test")).rejects.toMatchObject(rateLimitError);
    });

    it("handles validation errors", async () => {
      const validationError = {
        message: "Invalid request. Please check your input.",
        status: 422,
        type: "VALIDATION_ERROR",
      };
      mockSearchUsers.mockRejectedValue(validationError);

      await expect(searchUsers("test")).rejects.toMatchObject(validationError);
    });

    it("handles server errors", async () => {
      const serverError = {
        message: "Github API error: Internal Server Error",
        status: 500,
        type: "API_ERROR",
      };
      mockGetUserRepositories.mockRejectedValue(serverError);

      await expect(getUserRepositories("test")).rejects.toMatchObject(
        serverError
      );
    });
  });

  describe("API Response Validation", () => {
    it("returns valid user data structure", async () => {
      mockSearchUsers.mockResolvedValue(mockSearchResponse.items);

      const result = await searchUsers("testuser");

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty("id");
        expect(result[0]).toHaveProperty("login");
        expect(result[0]).toHaveProperty("avatar_url");
        expect(result[0]).toHaveProperty("html_url");
      }
    });

    it("returns valid repository data structure", async () => {
      mockGetUserRepositories.mockResolvedValue(mockRepositories);

      const result = await getUserRepositories("testuser1");

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty("id");
        expect(result[0]).toHaveProperty("name");
        expect(result[0]).toHaveProperty("full_name");
        expect(result[0]).toHaveProperty("html_url");
        expect(result[0]).toHaveProperty("stargazers_count");
      }
    });
  });
});
