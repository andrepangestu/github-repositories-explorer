import React from "react";
import { Star, GitFork, ChevronDown } from "lucide-react";
import { useGitHubApi } from "../hooks/useGitHubApi";

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

export const UserRepositories: React.FC = () => {
  const { state, fetchRepos } = useGitHubApi();
  const { selectedUser, repos, loadingRepos } = state;

  React.useEffect(() => {
    if (selectedUser && repos.length === 0 && !loadingRepos) {
      fetchRepos(selectedUser.login);
    }
  }, [selectedUser, repos.length, loadingRepos, fetchRepos]);

  if (!selectedUser) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Selected User Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={selectedUser.avatar_url}
              alt={selectedUser.login}
              className="w-8 h-8 rounded-full"
            />
            <span className="font-medium text-gray-900">
              {selectedUser.login}
            </span>
          </div>
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Loading State */}
      {loadingRepos && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading repositories...</p>
        </div>
      )}

      {/* Error State */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{state.error}</p>
        </div>
      )}

      {/* Repositories List */}
      {repos.length > 0 && (
        <div className="space-y-3">
          {repos.slice(0, 10).map((repo) => (
            <div
              key={repo.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    {repo.name}
                  </h3>
                  {repo.description && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {repo.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <span>{formatNumber(repo.stargazers_count)}</span>
                      <Star className="h-3 w-3 text-black" />
                    </div>
                    <div className="flex items-center space-x-1">
                      <GitFork className="h-3 w-3" />
                      <span>{formatNumber(repo.forks_count)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {repos.length > 10 && (
            <div className="text-center py-2">
              <p className="text-sm text-gray-500">
                Showing 10 of {repos.length} repositories
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
