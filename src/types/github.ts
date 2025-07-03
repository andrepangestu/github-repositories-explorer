// =============================================================================
// Github API Types
// =============================================================================

/**
 * Represents a Github user from the API
 */
export interface GithubUser {
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
 * Represents a Github repository from the API
 */
export interface GithubRepository {
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
 * Github search users API response structure
 */
export interface SearchUsersResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GithubUser[];
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

// =============================================================================
// Github API Context Types
// =============================================================================

/**
 * Github API state structure
 */
export interface GithubApiState {
  searchQuery: string;
  users: GithubUser[];
  selectedUser: GithubUser | null;
  repos: GithubRepository[];
  loadingUsers: boolean;
  loadingRepos: boolean;
  error: string | null;
  usersCache: Map<string, GithubUser[]>;
  reposCache: Map<string, GithubRepository[]>;
}

/**
 * Action types for the Github API context reducer
 */
export type GithubApiAction =
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_USERS"; payload: GithubUser[] }
  | { type: "SET_SELECTED_USER"; payload: GithubUser | null }
  | { type: "SET_REPOS"; payload: GithubRepository[] }
  | { type: "SET_LOADING_USERS"; payload: boolean }
  | { type: "SET_LOADING_REPOS"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CACHE_USERS"; payload: { query: string; users: GithubUser[] } }
  | {
      type: "CACHE_REPOS";
      payload: { username: string; repos: GithubRepository[] };
    }
  | { type: "CLEAR_SEARCH" };

/**
 * Context type for the Github API state and actions
 */
export interface GithubApiContextType {
  state: GithubApiState;
  fetchUsers: (query: string) => void;
  fetchRepos: (username: string) => Promise<void>;
  selectUser: (user: GithubUser) => void;
  setSearchQuery: (query: string) => void;
  triggerSearch: () => void;
  clearSearch: () => void;
}
