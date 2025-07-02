import React, { useRef, useCallback, useEffect } from "react";
import { useGithubApi } from "../hooks/useGithubApi";

export const SearchBar: React.FC = React.memo(() => {
  const { state, setSearchQuery, triggerSearch } = useGithubApi();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = useCallback(() => {
    const query = inputRef.current?.value.trim() ?? "";
    setSearchQuery(query);
  }, [setSearchQuery]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const query = inputRef.current?.value.trim();
      if (query) {
        setSearchQuery(query);
        triggerSearch();
      }
    },
    [setSearchQuery, triggerSearch]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [handleSubmit]
  );

  useEffect(() => {
    if (inputRef.current && state.searchQuery !== inputRef.current.value) {
      inputRef.current.value = state.searchQuery;
    }
  }, [state.searchQuery]);

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter username"
          defaultValue={state.searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
          aria-label="Enter Github username"
        />

        <button
          type="submit"
          disabled={state.loadingUsers}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {state.loadingUsers ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              <span>Searching...</span>
            </div>
          ) : (
            "Search"
          )}
        </button>
      </form>
    </div>
  );
});
