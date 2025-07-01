import React, {
  createContext,
  useReducer,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { GitHubApiService } from "../services/githubApi";
import type { GitHubUser, GitHubRepository } from "../types/github";

// =============================================================================
// Types
// =============================================================================

export interface GitHubApiState {
  searchQuery: string;
  users: GitHubUser[];
  selectedUser: GitHubUser | null;
  repos: GitHubRepository[];
  loadingUsers: boolean;
  loadingRepos: boolean;
  error: string | null;
  usersCache: Map<string, GitHubUser[]>;
  reposCache: Map<string, GitHubRepository[]>;
}

export type GitHubApiAction =
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_USERS"; payload: GitHubUser[] }
  | { type: "SET_SELECTED_USER"; payload: GitHubUser | null }
  | { type: "SET_REPOS"; payload: GitHubRepository[] }
  | { type: "SET_LOADING_USERS"; payload: boolean }
  | { type: "SET_LOADING_REPOS"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CACHE_USERS"; payload: { query: string; users: GitHubUser[] } }
  | {
      type: "CACHE_REPOS";
      payload: { username: string; repos: GitHubRepository[] };
    }
  | { type: "CLEAR_SEARCH" };

export interface GitHubApiContextType {
  // State
  state: GitHubApiState;
  // Actions
  fetchUsers: (query: string) => void;
  fetchRepos: (username: string) => Promise<void>;
  selectUser: (user: GitHubUser) => void;
  setSearchQuery: (query: string) => void;
  triggerSearch: () => void;
  clearSearch: () => void;
}

// =============================================================================
// Initial State
// =============================================================================

const initialState: GitHubApiState = {
  searchQuery: "",
  users: [],
  selectedUser: null,
  repos: [],
  loadingUsers: false,
  loadingRepos: false,
  error: null,
  usersCache: new Map(),
  reposCache: new Map(),
};

// =============================================================================
// Reducer
// =============================================================================

function githubApiReducer(
  state: GitHubApiState,
  action: GitHubApiAction
): GitHubApiState {
  switch (action.type) {
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };

    case "SET_USERS":
      return { ...state, users: action.payload };

    case "SET_SELECTED_USER":
      return { ...state, selectedUser: action.payload };

    case "SET_REPOS":
      return { ...state, repos: action.payload };

    case "SET_LOADING_USERS":
      return { ...state, loadingUsers: action.payload };

    case "SET_LOADING_REPOS":
      return { ...state, loadingRepos: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "CACHE_USERS": {
      const newUsersCache = new Map(state.usersCache);
      newUsersCache.set(action.payload.query, action.payload.users);
      return { ...state, usersCache: newUsersCache };
    }

    case "CACHE_REPOS": {
      const newReposCache = new Map(state.reposCache);
      newReposCache.set(action.payload.username, action.payload.repos);
      return { ...state, reposCache: newReposCache };
    }

    case "CLEAR_SEARCH":
      return {
        ...state,
        searchQuery: "",
        users: [],
        selectedUser: null,
        repos: [],
        loadingUsers: false,
        loadingRepos: false,
        error: null,
      };

    default:
      return state;
  }
}

// =============================================================================
// Context
// =============================================================================

export const GitHubApiContext = createContext<GitHubApiContextType | undefined>(
  undefined
);

// =============================================================================
// Provider Component
// =============================================================================

interface GitHubApiProviderProps {
  children: React.ReactNode;
}

export const GitHubApiProvider: React.FC<GitHubApiProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(githubApiReducer, initialState);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function for abort controller
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
  }, []);

  // Fetch users with caching and abort controller
  const fetchUsers = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        dispatch({
          type: "SET_ERROR",
          payload: "Please enter a username to search",
        });
        return;
      }

      // Check cache first
      const cachedUsers = state.usersCache.get(query.toLowerCase());
      if (cachedUsers) {
        dispatch({ type: "SET_USERS", payload: cachedUsers });
        dispatch({ type: "SET_ERROR", payload: null });
        return;
      }

      // Cancel any ongoing request
      cleanup();

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      dispatch({ type: "SET_LOADING_USERS", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });
      dispatch({ type: "SET_USERS", payload: [] });

      try {
        const searchResults = await GitHubApiService.searchUsers(query, 5);

        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        if (searchResults.length === 0) {
          dispatch({
            type: "SET_ERROR",
            payload: `No users found matching "${query}". Please try a different search term.`,
          });
        } else {
          dispatch({ type: "SET_USERS", payload: searchResults });
          dispatch({
            type: "CACHE_USERS",
            payload: { query: query.toLowerCase(), users: searchResults },
          });
        }
      } catch (err) {
        // Don't set error if request was aborted
        if (!abortControllerRef.current?.signal.aborted) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : "Failed to search users. Please try again.";
          dispatch({ type: "SET_ERROR", payload: errorMessage });
        }
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          dispatch({ type: "SET_LOADING_USERS", payload: false });
        }
        abortControllerRef.current = null;
      }
    },
    [state.usersCache, cleanup]
  );

  // Debounced version of fetchUsers
  const debouncedFetchUsers = useCallback(
    (query: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        fetchUsers(query);
      }, 300); // 300ms debounce
    },
    [fetchUsers]
  );

  // Fetch repositories with caching
  const fetchRepos = useCallback(
    async (username: string) => {
      if (!username.trim()) {
        return;
      }

      // Check cache first
      const cachedRepos = state.reposCache.get(username.toLowerCase());
      if (cachedRepos) {
        dispatch({ type: "SET_REPOS", payload: cachedRepos });
        return;
      }

      dispatch({ type: "SET_LOADING_REPOS", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      try {
        const repositories = await GitHubApiService.getUserRepositories(
          username
        );
        dispatch({ type: "SET_REPOS", payload: repositories });
        dispatch({
          type: "CACHE_REPOS",
          payload: { username: username.toLowerCase(), repos: repositories },
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to load repositories. Please try again.";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
      } finally {
        dispatch({ type: "SET_LOADING_REPOS", payload: false });
      }
    },
    [state.reposCache]
  );

  // Select user
  const selectUser = useCallback((user: GitHubUser) => {
    dispatch({ type: "SET_SELECTED_USER", payload: user });
  }, []);

  // Set search query without triggering search
  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: "SET_SEARCH_QUERY", payload: query });
  }, []);

  // Trigger search manually
  const triggerSearch = useCallback(() => {
    const query = state.searchQuery.trim();
    if (query) {
      debouncedFetchUsers(query);
    } else {
      dispatch({ type: "SET_USERS", payload: [] });
      dispatch({ type: "SET_ERROR", payload: null });
    }
  }, [state.searchQuery, debouncedFetchUsers]);

  // Clear search
  const clearSearch = useCallback(() => {
    cleanup();
    dispatch({ type: "CLEAR_SEARCH" });
  }, [cleanup]);

  // Context value with useMemo for performance
  const contextValue = useMemo<GitHubApiContextType>(
    () => ({
      state,
      fetchUsers: debouncedFetchUsers,
      fetchRepos,
      selectUser,
      setSearchQuery,
      triggerSearch,
      clearSearch,
    }),
    [
      state,
      debouncedFetchUsers,
      fetchRepos,
      selectUser,
      setSearchQuery,
      triggerSearch,
      clearSearch,
    ]
  );

  return (
    <GitHubApiContext.Provider value={contextValue}>
      {children}
    </GitHubApiContext.Provider>
  );
};
