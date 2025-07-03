import React, {
  createContext,
  useReducer,
  useCallback,
  useRef,
  useMemo,
  useEffect,
} from "react";
import { GithubApiService } from "../services/githubApi";
import type {
  GithubUser,
  GithubApiState,
  GithubApiAction,
  GithubApiContextType,
} from "../types/github";

const initialState: GithubApiState = {
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
  state: GithubApiState,
  action: GithubApiAction
): GithubApiState {
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

// eslint-disable-next-line react-refresh/only-export-components
export const GithubApiContext = createContext<GithubApiContextType | undefined>(
  undefined
);

// =============================================================================
// Provider Component
// =============================================================================

interface GithubApiProviderProps {
  children: React.ReactNode;
}

export const GithubApiProvider: React.FC<GithubApiProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(githubApiReducer, initialState);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const fetchUsers = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        dispatch({
          type: "SET_ERROR",
          payload: "Please enter a username to search",
        });
        return;
      }

      const cachedUsers = state.usersCache.get(query.toLowerCase());
      if (cachedUsers) {
        dispatch({ type: "SET_USERS", payload: cachedUsers });
        dispatch({ type: "SET_ERROR", payload: null });
        return;
      }

      cleanup();

      abortControllerRef.current = new AbortController();

      dispatch({ type: "SET_LOADING_USERS", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });
      dispatch({ type: "SET_USERS", payload: [] });

      try {
        const searchResults = await GithubApiService.searchUsers(query, 5);

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

  const debouncedFetchUsers = useCallback(
    (query: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        fetchUsers(query);
      }, 300);
    },
    [fetchUsers]
  );

  const fetchRepos = useCallback(
    async (username: string) => {
      if (!username.trim()) {
        return;
      }

      const cachedRepos = state.reposCache.get(username.toLowerCase());
      if (cachedRepos) {
        dispatch({ type: "SET_REPOS", payload: cachedRepos });
        return;
      }

      dispatch({ type: "SET_LOADING_REPOS", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      try {
        const repositories = await GithubApiService.getUserRepositories(
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

  const selectUser = useCallback((user: GithubUser) => {
    dispatch({ type: "SET_SELECTED_USER", payload: user });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: "SET_SEARCH_QUERY", payload: query });
  }, []);

  const triggerSearch = useCallback(() => {
    const query = state.searchQuery.trim();
    if (query) {
      debouncedFetchUsers(query);
    } else {
      dispatch({ type: "SET_USERS", payload: [] });
      dispatch({ type: "SET_ERROR", payload: null });
    }
  }, [state.searchQuery, debouncedFetchUsers]);

  const clearSearch = useCallback(() => {
    cleanup();
    dispatch({ type: "CLEAR_SEARCH" });
  }, [cleanup]);

  const contextValue = useMemo<GithubApiContextType>(
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
    <GithubApiContext.Provider value={contextValue}>
      {children}
    </GithubApiContext.Provider>
  );
};
