import React, { useState, useCallback, useEffect } from "react";
import { UserDropdown } from "./UserDropdown";
import { useGithubApi } from "../hooks/useGithubApi";
import type { GithubUser, GithubRepository } from "../types/github";

interface UserWithRepos extends GithubUser {
  repositories: GithubRepository[];
  isExpanded: boolean;
  isLoadingRepos: boolean;
  reposError: string | null;
}

export const UserList: React.FC = React.memo(() => {
  const { state, fetchRepos } = useGithubApi();
  const [usersWithRepos, setUsersWithRepos] = useState<UserWithRepos[]>([]);

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

  useEffect(() => {
    setUsersWithRepos((prev) =>
      prev.map((user) => {
        const cachedRepos = state.reposCache.get(user.login.toLowerCase());
        if (cachedRepos !== undefined && user.isExpanded) {
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
    (
      userId: number,
      repositories: GithubRepository[],
      isLoading: boolean,
      error: string | null
    ) => {
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

      const cachedRepos = state.reposCache.get(user.login.toLowerCase());
      if (cachedRepos !== undefined) {
        updateUserRepositories(userId, cachedRepos, false, null);
        return;
      }

      try {
        updateUserRepositories(userId, [], true, null);
        await fetchRepos(user.login);
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

      setUsersWithRepos((prev) => {
        return prev.map((u) => {
          if (u.id === userId) {
            if (newExpanded && u.repositories.length === 0) {
              const cachedRepos = state.reposCache.get(u.login.toLowerCase());
              if (cachedRepos !== undefined) {
                return {
                  ...u,
                  isExpanded: newExpanded,
                  repositories: cachedRepos,
                  isLoadingRepos: false,
                  reposError: null,
                };
              } else {
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

      if (newExpanded && user.repositories.length === 0) {
        const cachedRepos = state.reposCache.get(user.login.toLowerCase());
        if (cachedRepos === undefined) {
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
          Showing users for{" "}
          <span className="font-medium">"{state.searchQuery}"</span>
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
