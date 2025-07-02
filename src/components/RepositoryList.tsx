import React from "react";
import { Star } from "lucide-react";
import type { GithubRepository } from "../types/github";

interface RepositoryListProps {
  repositories: GithubRepository[];
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

export const RepositoryList: React.FC<RepositoryListProps> = React.memo(
  ({ repositories }) => {
    return (
      <div className="space-y-3">
        {repositories.map((repo) => (
          <div key={repo.id} className="bg-gray-50 p-3 rounded-md">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-4">
                <h3 className="font-bold text-gray-900 text-sm mb-1">
                  {repo.name}
                </h3>
                {repo.description && (
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {repo.description}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-1 flex-shrink-0">
                <span className="font-bold text-sm text-gray-900">
                  {formatNumber(repo.stargazers_count)}
                </span>
                <Star className="h-4 w-4 text-black fill-current" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
);
