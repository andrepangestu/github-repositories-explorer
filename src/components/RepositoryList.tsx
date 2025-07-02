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
    const handleRepositoryClick = (url: string) => {
      window.open(url, "_blank", "noopener,noreferrer");
    };

    return (
      <div className="space-y-3">
        {repositories.map((repo) => (
          <div key={repo.id} className="bg-gray-50 p-3 rounded-md">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-4">
                <button
                  className="font-bold text-gray-600 hover:text-gray-800 text-sm mb-1 cursor-pointer transition-colors text-left p-0 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 rounded"
                  onClick={() => handleRepositoryClick(repo.html_url)}
                  title={`Open ${repo.name} on GitHub`}
                  type="button"
                >
                  {repo.name}
                </button>
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
