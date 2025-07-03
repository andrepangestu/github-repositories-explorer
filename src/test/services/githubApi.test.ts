import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import axios from "axios";
import { GithubApiService } from "../../services/githubApi";
import {
  createMockUser,
  createMockRepository,
  createMockSearchResponse,
} from "../test-utils";

vi.mock("axios", () => {
  const mockAxiosInstance = {
    get: vi.fn(),
  };

  const mockIsAxiosError = vi.fn();

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
      isAxiosError: mockIsAxiosError,
    },
  };
});

const mockAxios = vi.mocked(axios);

describe("GithubApiService", () => {
  let mockAxiosInstance: {
    get: Mock;
  };
  let mockIsAxiosError: Mock;

  beforeEach(() => {
    vi.clearAllMocks();

    mockAxiosInstance = (mockAxios.create as Mock)();
    mockIsAxiosError = mockAxios.isAxiosError as unknown as Mock;

    mockAxiosInstance.get.mockReset();
    mockIsAxiosError.mockReturnValue(false);
  });

  describe("searchUsers", () => {
    it("should search for users successfully", async () => {
      const mockUsers = [
        createMockUser(),
        createMockUser({ id: 2, login: "testuser2" }),
      ];
      const mockResponse = createMockSearchResponse(mockUsers);

      mockAxiosInstance.get.mockResolvedValue({ data: mockResponse });

      const result = await GithubApiService.searchUsers("testuser", 5);

      expect(result).toEqual(mockUsers);
    });

    it("should handle empty search results", async () => {
      const mockResponse = createMockSearchResponse([]);

      mockAxiosInstance.get.mockResolvedValue({ data: mockResponse });

      const result = await GithubApiService.searchUsers("nonexistent", 5);
      expect(result).toEqual([]);
    });

    it("should validate search query - empty string", async () => {
      await expect(GithubApiService.searchUsers("")).rejects.toThrow(
        "Search query cannot be empty"
      );
    });

    it("should validate search query - whitespace only", async () => {
      await expect(GithubApiService.searchUsers("   ")).rejects.toThrow(
        "Search query cannot be empty"
      );
    });

    it("should validate search query - too long", async () => {
      const longQuery = "a".repeat(257);
      await expect(GithubApiService.searchUsers(longQuery)).rejects.toThrow(
        "Search query is too long"
      );
    });

    it("should validate search limit - below minimum", async () => {
      await expect(GithubApiService.searchUsers("testuser", 0)).rejects.toThrow(
        "Search limit must be between 1 and 100"
      );
    });

    it("should validate search limit - above maximum", async () => {
      await expect(
        GithubApiService.searchUsers("testuser", 101)
      ).rejects.toThrow("Search limit must be between 1 and 100");
    });

    it("should handle API rate limit error (403)", async () => {
      const error = new Error("API rate limit exceeded");
      (
        error as Error & {
          response?: { status: number; data: { message: string } };
        }
      ).response = {
        status: 403,
        data: { message: "API rate limit exceeded" },
      };

      mockAxiosInstance.get.mockRejectedValue(error);
      mockIsAxiosError.mockReturnValue(true);

      await expect(GithubApiService.searchUsers("testuser")).rejects.toThrow(
        "Github API rate limit exceeded. Please try again later."
      );
    });

    it("should handle network errors", async () => {
      const error = new Error("Network Error");

      mockAxiosInstance.get.mockRejectedValue(error);
      mockIsAxiosError.mockReturnValue(false);

      await expect(GithubApiService.searchUsers("testuser")).rejects.toThrow(
        "Network error. Please check your internet connection."
      );
    });
  });

  describe("getUserRepositories", () => {
    it("should get user repositories successfully", async () => {
      const mockRepos = [
        createMockRepository(),
        createMockRepository({ id: 2, name: "test-repo-2" }),
      ];

      mockAxiosInstance.get.mockResolvedValue({ data: mockRepos });

      const result = await GithubApiService.getUserRepositories("testuser");

      expect(result).toEqual(mockRepos);
    });

    it("should handle empty repository list", async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      const result = await GithubApiService.getUserRepositories("testuser");
      expect(result).toEqual([]);
    });

    it("should handle pagination for large repository lists", async () => {
      const firstPageRepos = Array.from({ length: 100 }, (_, i) =>
        createMockRepository({ id: i + 1, name: `repo-${i + 1}` })
      );
      const secondPageRepos = Array.from({ length: 50 }, (_, i) =>
        createMockRepository({ id: i + 101, name: `repo-${i + 101}` })
      );

      mockAxiosInstance.get
        .mockResolvedValueOnce({ data: firstPageRepos })
        .mockResolvedValueOnce({ data: secondPageRepos });

      const result = await GithubApiService.getUserRepositories("testuser");

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(150);
      expect(result[0]).toEqual(firstPageRepos[0]);
      expect(result[149]).toEqual(secondPageRepos[49]);
    });

    it("should validate username - empty string", async () => {
      await expect(GithubApiService.getUserRepositories("")).rejects.toThrow(
        "Username cannot be empty"
      );
    });

    it("should validate username - whitespace only", async () => {
      await expect(GithubApiService.getUserRepositories("   ")).rejects.toThrow(
        "Username cannot be empty"
      );
    });

    it("should handle API errors for repository fetch", async () => {
      const error = new Error("User not found");
      (
        error as Error & {
          response?: { status: number; data: { message: string } };
        }
      ).response = {
        status: 404,
        data: { message: "Not Found" },
      };

      mockAxiosInstance.get.mockRejectedValue(error);
      mockIsAxiosError.mockReturnValue(true);

      await expect(
        GithubApiService.getUserRepositories("nonexistent")
      ).rejects.toThrow("Resource not found.");
    });
  });
});
