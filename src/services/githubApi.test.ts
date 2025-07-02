import { vi, describe, it, expect, beforeEach } from "vitest";
import { mockAxiosInstance, mockAxios } from "../test/setup";
import { GithubApiService } from "./githubApi";
import type {
  GithubUser,
  GithubRepository,
  SearchUsersResponse,
} from "../types/github";

describe("GithubApiService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("searchUsers", () => {
    it("should search for users successfully", async () => {
      const mockUser: GithubUser = {
        id: 1,
        login: "testuser",
        avatar_url: "https://example.com/avatar.jpg",
        html_url: "https://github.com/testuser",
        type: "User",
        name: "Test User",
        bio: "A test user",
        location: "Test City",
        public_repos: 10,
        followers: 5,
        following: 3,
        created_at: "2020-01-01T00:00:00Z",
      };

      const mockResponse: SearchUsersResponse = {
        total_count: 1,
        incomplete_results: false,
        items: [mockUser],
      };

      // Mock the axios instance get method - service expects { data: ... }
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockResponse });

      const result = await GithubApiService.searchUsers("testuser", 5);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/search/users", {
        params: {
          q: "testuser",
          per_page: 5,
          sort: "followers",
          order: "desc",
        },
      });
      expect(result).toEqual([mockUser]);
    });

    it("should handle empty search results", async () => {
      const mockResponse: SearchUsersResponse = {
        total_count: 0,
        incomplete_results: false,
        items: [],
      };

      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockResponse });

      const result = await GithubApiService.searchUsers("nonexistent", 5);

      expect(result).toEqual([]);
    });

    it("should handle API errors", async () => {
      const mockError = {
        response: {
          status: 403,
          data: { message: "API rate limit exceeded" },
        },
      };

      mockAxios.isAxiosError.mockReturnValueOnce(true);
      mockAxiosInstance.get.mockRejectedValueOnce(mockError);

      await expect(GithubApiService.searchUsers("testuser", 5)).rejects.toEqual(
        {
          message: "Github API rate limit exceeded. Please try again later.",
          status: 403,
          type: "API_ERROR",
        }
      );
    });

    it("should handle network errors", async () => {
      const networkError = new Error("Network Error");

      mockAxios.isAxiosError.mockReturnValueOnce(false);
      mockAxiosInstance.get.mockRejectedValueOnce(networkError);

      await expect(GithubApiService.searchUsers("testuser", 5)).rejects.toEqual(
        {
          message: "Network error. Please check your internet connection.",
          type: "NETWORK_ERROR",
        }
      );
    });
  });

  describe("getUserRepositories", () => {
    it("should fetch user repositories successfully", async () => {
      const mockRepos: GithubRepository[] = [
        {
          id: 1,
          name: "test-repo",
          full_name: "testuser/test-repo",
          description: "A test repository",
          html_url: "https://github.com/testuser/test-repo",
          stargazers_count: 10,
          watchers_count: 8,
          forks_count: 5,
          language: "TypeScript",
          updated_at: "2023-01-01T00:00:00Z",
          created_at: "2020-01-01T00:00:00Z",
          topics: ["test", "repo"],
          visibility: "public",
          default_branch: "main",
        },
      ];

      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockRepos });

      const result = await GithubApiService.getUserRepositories("testuser");

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        "/users/testuser/repos",
        {
          params: {
            sort: "updated",
            direction: "desc",
            per_page: 100,
            type: "public",
            page: 1,
          },
        }
      );
      expect(result).toEqual(mockRepos);
    });

    it("should handle empty repositories", async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: [] });

      const result = await GithubApiService.getUserRepositories("testuser");

      expect(result).toEqual([]);
    });

    it("should handle user not found error", async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: "Not Found" },
        },
      };

      mockAxios.isAxiosError.mockReturnValueOnce(true);
      mockAxiosInstance.get.mockRejectedValueOnce(mockError);

      await expect(
        GithubApiService.getUserRepositories("nonexistent")
      ).rejects.toEqual({
        message: "Resource not found.",
        status: 404,
        type: "NOT_FOUND",
      });
    });
  });
});
