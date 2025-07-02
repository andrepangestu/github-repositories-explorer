import React from "react";
import { GithubApiProvider } from "./contexts/GithubApiContext";
import { SearchBar } from "./components/SearchBar";
import { UserList } from "./components/UserList";
import { useGithubApi } from "./hooks/useGithubApi";

const AppContent: React.FC = () => {
  const { state } = useGithubApi();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <SearchBar />

        {/* Error Message */}
        {state.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {state.error}
          </div>
        )}

        {/* User List */}
        {state.users.length > 0 && !state.error && <UserList />}
      </div>
    </div>
  );
};

function App() {
  return (
    <GithubApiProvider>
      <AppContent />
    </GithubApiProvider>
  );
}

export default App;
