import axios, { type AxiosInstance } from "axios";
import type {
  GithubUser,
  GithubRepository,
  SearchUsersResponse,
  AppError,
} from "../types/github";

const API_CONFIG = {
  baseURL: "https://api.github.com",
  timeout: 10000,
  headers: {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Github-Repositories-Explorer",
  },
} as const;

const SEARCH_CONFIG = {
  maxResults: 5,
  maxReposPerPage: 100,
} as const;

class GithubApiClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create(API_CONFIG);
  }

  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    try {
      const response = await this.client.get<T>(url, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): AppError {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message ?? error.message;

      switch (status) {
        case 403:
          return {
            message: "Github API rate limit exceeded. Please try again later.",
            status,
            type: "API_ERROR",
          };
        case 404:
          return {
            message: "Resource not found.",
            status,
            type: "NOT_FOUND",
          };
        case 422:
          return {
            message: "Invalid request. Please check your input.",
            status,
            type: "VALIDATION_ERROR",
          };
        default:
          return {
            message: `Github API error: ${message}`,
            status,
            type: "API_ERROR",
          };
      }
    }

    return {
      message: "Network error. Please check your internet connection.",
      type: "NETWORK_ERROR",
    };
  }
}

const apiClient = new GithubApiClient();

function validateSearchQuery(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new Error("Search query cannot be empty");
  }
  if (trimmed.length > 256) {
    throw new Error("Search query is too long");
  }
  return trimmed;
}

function validateSearchLimit(limit: number): number {
  if (limit < 1 || limit > 100) {
    throw new Error("Search limit must be between 1 and 100");
  }
  return limit;
}

export async function searchUsers(
  query: string,
  limit: number = SEARCH_CONFIG.maxResults
): Promise<GithubUser[]> {
  const validQuery = validateSearchQuery(query);
  const validLimit = validateSearchLimit(limit);

  const response = await apiClient.get<SearchUsersResponse>("/search/users", {
    q: validQuery,
    per_page: validLimit,
    sort: "followers",
    order: "desc",
  });

  return response.items;
}

export async function getUserRepositories(
  username: string
): Promise<GithubRepository[]> {
  const trimmedUsername = username.trim();
  if (!trimmedUsername) {
    throw new Error("Username cannot be empty");
  }

  const repositories: GithubRepository[] = [];
  let page = 1;
  let hasMorePages = true;

  while (hasMorePages) {
    const pageRepos = await apiClient.get<GithubRepository[]>(
      `/users/${trimmedUsername}/repos`,
      {
        sort: "updated",
        direction: "desc",
        per_page: SEARCH_CONFIG.maxReposPerPage,
        type: "public",
        page,
      }
    );

    repositories.push(...pageRepos);

    hasMorePages = pageRepos.length === SEARCH_CONFIG.maxReposPerPage;
    page++;
  }

  return repositories;
}

// Legacy support - keep the class interface for backward compatibility
export class GithubApiService {
  static async searchUsers(
    query: string,
    limit?: number
  ): Promise<GithubUser[]> {
    return searchUsers(query, limit);
  }

  static async getUserRepositories(
    username: string
  ): Promise<GithubRepository[]> {
    return getUserRepositories(username);
  }
}
