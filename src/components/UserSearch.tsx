import React, { useState, useRef } from "react";
import { ChevronDown, ChevronUp, Star } from "lucide-react";
import type { GitHubUser, GitHubRepository } from "../types/github";
import { GitHubApiService } from "../services/githubApi";
import { formatNumber } from "../utils/helpers";

interface UserSearchProps {
  onUserSelect: (user: GitHubUser) => void;
  isLoading: boolean;
}

interface UserWithRepos extends GitHubUser {
  repositories?: GitHubRepository[];
  isExpanded?: boolean;
  isLoadingRepos?: boolean;
  reposError?: string | null;
}

export const UserSearch: React.FC<UserSearchProps> = ({
  onUserSelect,
  isLoading,
}) => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserWithRepos[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const renderRepositoryContent = (user: UserWithRepos) => {
    if (user.isLoadingRepos) {
      return (
        <div className="text-center py-4">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading repositories...</p>
        </div>
      );
    }

    if (user.reposError) {
      return (
        <div className="text-center py-4">
          <p className="text-sm text-red-600">{user.reposError}</p>
        </div>
      );
    }

    if (user.repositories && user.repositories.length > 0) {
      return (
        <div className="space-y-2 pt-2">
          {user.repositories.map((repo) => (
            <div
              key={repo.id}
              className="bg-white rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 transition-colors"
                    >
                      {repo.name}
                    </a>
                  </h4>
                  {repo.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {repo.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-1 text-gray-700 ml-4">
                  <Star
                    className="h-4 w-4 text-yellow-500"
                    fill="currentColor"
                  />
                  <span className="font-semibold text-sm">
                    {formatNumber(repo.stargazers_count)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-600">No public repositories found</p>
      </div>
    );
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      setUsers([]);
      setShowDropdown(false);
      setError("Please enter a username to search");
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const searchResults = await GitHubApiService.searchUsers(query, 5);
      const usersWithRepos: UserWithRepos[] = searchResults.map((user) => ({
        ...user,
        repositories: [],
        isExpanded: false,
        isLoadingRepos: false,
        reposError: null,
      }));

      setUsers(usersWithRepos);
      setShowDropdown(searchResults.length > 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search users");
      setUsers([]);
      setShowDropdown(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const toggleUserExpansion = async (userIndex: number) => {
    const user = users[userIndex];

    // Notify parent about user selection
    onUserSelect(user);

    if (user.isExpanded) {
      // Collapse the user
      setUsers((prev) =>
        prev.map((u, i) => (i === userIndex ? { ...u, isExpanded: false } : u))
      );
    } else {
      // Expand the user and load repositories
      setUsers((prev) =>
        prev.map(
          (u, i) =>
            i === userIndex
              ? {
                  ...u,
                  isExpanded: true,
                  isLoadingRepos: true,
                  reposError: null,
                }
              : { ...u, isExpanded: false } // Collapse others
        )
      );

      try {
        const repositories = await GitHubApiService.getUserRepositories(
          user.login
        );
        setUsers((prev) =>
          prev.map((u, i) =>
            i === userIndex ? { ...u, repositories, isLoadingRepos: false } : u
          )
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch repositories";
        setUsers((prev) =>
          prev.map((u, i) =>
            i === userIndex
              ? { ...u, isLoadingRepos: false, reposError: errorMessage }
              : u
          )
        );
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto" ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative mb-4">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter username"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
          aria-label="Search GitHub users"
          disabled={isLoading}
        />
      </div>

      {/* Search Button */}
      <button
        type="button"
        onClick={handleSearch}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium mb-4"
        disabled={isLoading || isSearching}
      >
        {isSearching || isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            Searching...
          </div>
        ) : (
          "Search"
        )}
      </button>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Search Results */}
      {showDropdown && users.length > 0 && (
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="p-3 text-sm text-gray-600 border-b border-gray-100 bg-gray-50">
            Showing users for "{query}"
          </div>

          {users.map((user, index) => (
            <div
              key={user.id}
              className="border-b border-gray-100 last:border-b-0"
            >
              {/* User Header */}
              <button
                type="button"
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors duration-150 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                onClick={() => toggleUserExpansion(index)}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={user.avatar_url}
                    alt={`${user.login}'s avatar`}
                    className="h-8 w-8 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-gray-900 truncate block">
                      {user.login}
                    </span>
                    {user.name && (
                      <p className="text-sm text-gray-500 truncate">
                        {user.name}
                      </p>
                    )}
                  </div>
                </div>
                {user.isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {/* Expanded Repository List */}
              {user.isExpanded && (
                <div className="bg-gray-50 px-4 pb-4">
                  {renderRepositoryContent(user)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
