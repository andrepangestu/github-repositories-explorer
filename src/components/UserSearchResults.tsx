import React from "react";
import { useGitHubApi } from "../hooks/useGitHubApi";

export const UserSearchResults: React.FC = () => {
  const { state, selectUser } = useGitHubApi();

  const handleUserSelect = (user: (typeof state.users)[0]) => {
    selectUser(user);
  };

  if (state.users.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
      <div className="p-2 border-b border-gray-100">
        <p className="text-xs text-gray-500 px-2">
          Showing users for "{state.searchQuery}"
        </p>
      </div>

      <div className="py-1">
        {state.users.map((user) => (
          <button
            key={user.id}
            onClick={() => handleUserSelect(user)}
            className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
          >
            <div className="flex items-center space-x-3">
              <img
                src={user.avatar_url}
                alt={user.login}
                className="w-6 h-6 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.login}
                </p>
                {user.name && (
                  <p className="text-xs text-gray-500 truncate">{user.name}</p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
