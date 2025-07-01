import { useState } from "react";
import { Code, AlertCircle } from "lucide-react";
import type { GitHubUser } from "./types/github";
import { UserSearch } from "./components/UserSearch";

function App() {
  const [selectedUser, setSelectedUser] = useState<GitHubUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUserSelect = (user: GitHubUser) => {
    setSelectedUser(user);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center space-x-3">
            <h1 className="text-3xl font-bold text-gray-900">
              GitHub Repositories Explorer
            </h1>
          </div>
          <p className="text-center text-gray-600 mt-2">
            Search for GitHub users and explore their public repositories
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Search Section */}
        <section className="mb-8">
          <UserSearch onUserSelect={handleUserSelect} isLoading={false} />
        </section>

        {/* Error Alert */}
        {error && (
          <section className="mb-8">
            <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </section>
        )}

        {/* Instructions */}
        {!selectedUser && !error && (
          <section className="text-center py-16">
            <div className="max-w-md mx-auto">
              <Code className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Get Started
              </h2>
              <p className="text-gray-600">
                Enter a GitHub username above to search for users and explore
                their repositories.
              </p>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Built with React, TypeScript, and Tailwind CSS. Data from{" "}
            <a
              href="https://docs.github.com/en/rest"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
            >
              GitHub REST API
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
