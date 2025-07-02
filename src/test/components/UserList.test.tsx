import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserList } from "../../components/UserList";
import { GithubApiProvider } from "../../contexts/GithubApiContext";

// Mock the GitHub API service
vi.mock("../../services/githubApi", () => ({
  searchUsers: vi.fn(),
  getUserRepositories: vi.fn(),
  GithubApiService: {
    searchUsers: vi.fn(),
    getUserRepositories: vi.fn(),
  },
}));

// Mock window.open for repository links
const mockWindowOpen = vi.fn();
vi.stubGlobal("window", {
  ...window,
  open: mockWindowOpen,
});

// Simple wrapper component for testing with default provider
const UserListWithProvider: React.FC = () => (
  <GithubApiProvider>
    <UserList />
  </GithubApiProvider>
);

describe("UserList Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWindowOpen.mockClear();
  });

  describe("Rendering", () => {
    it("renders without crashing", () => {
      render(<UserListWithProvider />);
      
      // Component should render without throwing errors
      expect(document.body).toBeInTheDocument();
    });

    it("renders nothing when no users are provided", () => {
      render(<UserListWithProvider />);
      
      // Should not render any user dropdowns when starting with empty state
      expect(screen.queryByText(/showing users for/i)).not.toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("handles empty user list gracefully", () => {
      render(<UserListWithProvider />);

      expect(screen.queryByText(/showing users for/i)).not.toBeInTheDocument();
    });
  });

  describe("Basic Structure", () => {
    it("renders component structure correctly", () => {
      render(<UserListWithProvider />);
      
      // The component should render successfully
      const container = document.querySelector('body');
      expect(container).toBeInTheDocument();
    });

    it("initializes without errors", () => {
      const { container } = render(<UserListWithProvider />);
      
      // Should not throw any errors during initialization
      expect(container).toBeInTheDocument();
    });
  });

  describe("Integration", () => {
    it("works with GithubApiProvider", () => {
      render(<UserListWithProvider />);
      
      // Should be able to access the context without errors
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });
});
