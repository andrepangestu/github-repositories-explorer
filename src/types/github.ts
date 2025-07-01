// =============================================================================
// GitHub API Types
// =============================================================================

/**
 * Represents a GitHub user from the API
 */
export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  type: string;
  name?: string;
  bio?: string;
  location?: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

/**
 * Represents a GitHub repository from the API
 */
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  created_at: string;
  topics: string[];
  visibility: string;
  default_branch: string;
}

/**
 * GitHub search users API response structure
 */
export interface SearchUsersResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubUser[];
}

// =============================================================================
// Application Types
// =============================================================================

/**
 * Standardized error structure for the application
 */
export interface AppError {
  message: string;
  status?: number;
  type: "NETWORK_ERROR" | "API_ERROR" | "VALIDATION_ERROR" | "NOT_FOUND";
}
