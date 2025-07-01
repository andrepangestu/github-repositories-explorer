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

export interface SearchUsersResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubUser[];
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface LoadingState {
  isSearchingUsers: boolean;
  isLoadingRepos: boolean;
}
