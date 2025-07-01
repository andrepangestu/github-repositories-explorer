import React, { useRef } from "react";
import { Search } from "lucide-react";
import { useGitHubApi } from "../hooks/useGitHubApi";
import { UserSearchResults } from "./UserSearchResults";

export const UserSearch: React.FC = () => {
  const { state, setSearchQuery, clearSearch } = useGitHubApi();

  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    const query = inputRef.current?.value.trim() ?? "";
    setSearchQuery(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
    if (e.key === "Escape") {
      clearSearch();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.trim();
    setSearchQuery(query);
  };

  return (
    <div className="relative max-w-md mx-auto">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter username"
          value={state.searchQuery}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
          aria-label="Search GitHub users"
        />

        <button
          onClick={handleSearch}
          disabled={state.loadingUsers}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          aria-label="Search"
        >
          {state.loadingUsers ? (
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Search size={16} />
          )}
        </button>
      </div>

      {state.loadingUsers && <LoadingIndicator />}
      {state.error && <ErrorMessage error={state.error} />}
      {state.users.length > 0 && <UserSearchResults />}
    </div>
  );
};

const LoadingIndicator: React.FC = () => (
  <div className="mt-2 text-center text-sm text-gray-600">Searching...</div>
);

const ErrorMessage: React.FC<{ error: string }> = ({ error }) => (
  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
    {error}
  </div>
);
