import React, { useState, useCallback, useEffect } from "react";
import { UserDropdown } from "./UserDropdown";
import { useGitHubApi } from "../hooks/useGitHubApi";
import type { GitHubUser, GitHubRepository } from "../types/github";

interface UserWithRepos extends GitHubUser {
  repositories: GitHubRepository[];
  isExpanded: boolean;
  isLoadingRepos: boolean;
  reposError: string | null;
}

export const UserList: React.FC = React.memo(() => {
  const { state, fetchRepos } = useGitHubApi();
  const [usersWithRepos, setUsersWithRepos] = useState<UserWithRepos[]>([]);

  // Initialize users when the users state changes
  useEffect(() => {
    setUsersWithRepos(
      state.users.map((user) => ({
        ...user,
        repositories: [],
        isExpanded: false,
        isLoadingRepos: false,
        reposError: null,
      }))
    );
  }, [state.users]);

  // Update repositories when cache changes
  useEffect(() => {
    setUsersWithRepos((prev) =>
      prev.map((user) => {
        const cachedRepos = state.reposCache.get(user.login.toLowerCase());
        if (cachedRepos && user.isExpanded && user.repositories.length !== cachedRepos.length) {
          return {
            ...user,
            repositories: cachedRepos,
            isLoadingRepos: false,
            reposError: null,
          };
        }
        return user;
      })
    );
  }, [state.reposCache]);

  const updateUserRepositories = useCallback(
    (userId: number, repositories: GitHubRepository[], isLoading: boolean, error: string | null) => {
      setUsersWithRepos((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                repositories,
                isLoadingRepos: isLoading,
                reposError: error,
              }
            : u
        )
      );
    },
    []
  );

  const loadUserRepositories = useCallback(
    async (userId: number) => {
      const user = usersWithRepos.find((u) => u.id === userId);
      if (!user) return;

      // First check if we already have cached repositories
      const cachedRepos = state.reposCache.get(user.login.toLowerCase());
      if (cachedRepos && cachedRepos.length > 0) {
        updateUserRepositories(userId, cachedRepos, false, null);
        return;
      }

      try {
        await fetchRepos(user.login);
        // The useEffect watching state.reposCache will update the UI
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load repositories";
        updateUserRepositories(userId, [], false, errorMessage);
      }
    },
    [usersWithRepos, fetchRepos, state.reposCache, updateUserRepositories]
  );

  const toggleUser = useCallback(
    (userId: number) => {
      const user = usersWithRepos.find((u) => u.id === userId);
      if (!user) return;

      const newExpanded = !user.isExpanded;

      // Update the user state
      setUsersWithRepos((prev) => {
        return prev.map((u) => {
          if (u.id === userId) {
            // If expanding for the first time, we need to load repositories
            if (newExpanded && u.repositories.length === 0) {
              // Check cache first
              const cachedRepos = state.reposCache.get(u.login.toLowerCase());
              if (cachedRepos && cachedRepos.length > 0) {
                // Use cached repositories immediately
                return {
                  ...u,
                  isExpanded: newExpanded,
                  repositories: cachedRepos,
                  isLoadingRepos: false,
                  reposError: null,
                };
              } else {
                // Set loading state
                return {
                  ...u,
                  isExpanded: newExpanded,
                  isLoadingRepos: true,
                  reposError: null,
                };
              }
            }

            return { ...u, isExpanded: newExpanded };
          }
          return u;
        });
      });

      // If we need to load repositories, do it after state update
      if (newExpanded && user.repositories.length === 0) {
        const cachedRepos = state.reposCache.get(user.login.toLowerCase());
        if (!cachedRepos || cachedRepos.length === 0) {
          loadUserRepositories(userId);
        }
      }
    },
    [usersWithRepos, loadUserRepositories, state.reposCache]
  );

  if (state.users.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-6">
      <div className="mb-4">
        <h2 className="text-sm text-gray-700">
          Showing users for "<span className="font-medium">{state.searchQuery}</span>"
        </h2>
      </div>

      <div className="space-y-2">
        {usersWithRepos.map((user) => (
          <UserDropdown
            key={user.id}
            user={user}
            repositories={user.repositories}
            isExpanded={user.isExpanded}
            isLoadingRepos={user.isLoadingRepos}
            reposError={user.reposError}
            onToggle={() => toggleUser(user.id)}
          />
        ))}
      </div>
    </div>
  );
});
