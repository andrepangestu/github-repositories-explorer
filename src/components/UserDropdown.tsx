import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { GithubUser, GithubRepository } from "../types/github";
import { RepositoryList } from "./RepositoryList";

interface UserDropdownProps {
  user: GithubUser;
  repositories: GithubRepository[];
  isExpanded: boolean;
  isLoadingRepos: boolean;
  reposError: string | null;
  onToggle: () => void;
}

export const UserDropdown: React.FC<UserDropdownProps> = React.memo(
  ({
    user,
    repositories,
    isExpanded,
    isLoadingRepos,
    reposError,
    onToggle,
  }) => {
    return (
      <div className="border border-gray-300 rounded-md bg-white">
        <button
          onClick={onToggle}
          className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors rounded-md"
          aria-expanded={isExpanded}
          aria-controls={`repos-${user.id}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-gray-900 font-semibold">{user.login}</span>
            {isExpanded ? (
              <ChevronUp
                className="h-4 w-4 text-gray-500"
                data-testid="chevron-up"
              />
            ) : (
              <ChevronDown
                className="h-4 w-4 text-gray-500"
                data-testid="chevron-down"
              />
            )}
          </div>
        </button>

        {isExpanded && (
          <div id={`repos-${user.id}`} className="border-t border-gray-200 p-4">
            {isLoadingRepos && (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full mr-2" />
                <span className="text-gray-600 text-sm">
                  Loading repositories...
                </span>
              </div>
            )}

            {reposError && (
              <div className="text-center py-6">
                <div className="text-red-600 text-sm">{reposError}</div>
              </div>
            )}

            {!isLoadingRepos && !reposError && repositories.length === 0 && (
              <div className="text-center py-6 text-gray-500 text-sm">
                No public repositories found
              </div>
            )}

            {!isLoadingRepos && !reposError && repositories.length > 0 && (
              <RepositoryList repositories={repositories} />
            )}
          </div>
        )}
      </div>
    );
  }
);
