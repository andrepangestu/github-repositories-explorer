import axios from "axios";
import type {
  GitHubUser,
  GitHubRepository,
  SearchUsersResponse,
} from "../types/github";

const GITHUB_API_BASE_URL = "https://api.github.com";

// Create axios instance with default config
const githubApi = axios.create({
  baseURL: GITHUB_API_BASE_URL,
  timeout: 10000,
  headers: {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "GitHub-Repositories-Explorer",
  },
});

export class GitHubApiService {
  /**
   * Search for GitHub users by username
   * @param query The search query (username)
   * @param limit Maximum number of results to return (default: 5)
   * @returns Promise with array of users
   */
  static async searchUsers(
    query: string,
    limit: number = 5
  ): Promise<GitHubUser[]> {
    if (!query.trim()) {
      return [];
    }

    try {
      const response = await githubApi.get<SearchUsersResponse>(
        "/search/users",
        {
          params: {
            q: query,
            per_page: limit,
            sort: "followers",
            order: "desc",
          },
        }
      );

      return response.data.items;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          throw new Error(
            "GitHub API rate limit exceeded. Please try again later."
          );
        }
        if (error.response?.status === 422) {
          throw new Error("Invalid search query. Please check your input.");
        }
        throw new Error(
          `GitHub API error: ${error.response?.data?.message ?? error.message}`
        );
      }
      throw new Error(
        "Failed to search users. Please check your internet connection."
      );
    }
  }

  /**
   * Get repositories for a specific user
   * @param username The GitHub username
   * @returns Promise with array of repositories
   */
  static async getUserRepositories(
    username: string
  ): Promise<GitHubRepository[]> {
    if (!username.trim()) {
      return [];
    }

    try {
      let allRepositories: GitHubRepository[] = [];
      let page = 1;
      const perPage = 100; // GitHub API maximum per page

      while (true) {
        const response = await githubApi.get<GitHubRepository[]>(
          `/users/${username}/repos`,
          {
            params: {
              sort: "updated",
              direction: "desc",
              per_page: perPage,
              type: "public",
              page: page,
            },
          }
        );

        const repositories = response.data;
        allRepositories = [...allRepositories, ...repositories];

        // If we got less than perPage results, we've reached the end
        if (repositories.length < perPage) {
          break;
        }

        page++;
      }

      return allRepositories;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error(`User "${username}" not found.`);
        }
        if (error.response?.status === 403) {
          throw new Error(
            "GitHub API rate limit exceeded. Please try again later."
          );
        }
        throw new Error(
          `GitHub API error: ${error.response?.data?.message ?? error.message}`
        );
      }
      throw new Error(
        "Failed to fetch repositories. Please check your internet connection."
      );
    }
  }

  /**
   * Get user details by username
   * @param username The GitHub username
   * @returns Promise with user details
   */
  static async getUser(username: string): Promise<GitHubUser> {
    if (!username.trim()) {
      throw new Error("Username is required");
    }

    try {
      const response = await githubApi.get<GitHubUser>(`/users/${username}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error(`User "${username}" not found.`);
        }
        if (error.response?.status === 403) {
          throw new Error(
            "GitHub API rate limit exceeded. Please try again later."
          );
        }
        throw new Error(
          `GitHub API error: ${error.response?.data?.message ?? error.message}`
        );
      }
      throw new Error(
        "Failed to fetch user details. Please check your internet connection."
      );
    }
  }
}
