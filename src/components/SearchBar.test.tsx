import { describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { render, createUser, mockAxiosInstance } from "../test/test-utils";
import { SearchBar } from "./SearchBar";
import type { SearchUsersResponse } from "../types/github";

describe("SearchBar", () => {
  beforeEach(() => {
    mockAxiosInstance.get.mockReset();
  });

  it("renders search input and button", () => {
    render(<SearchBar />);

    expect(
      screen.getByRole("textbox", { name: /github username/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  it("allows user to type in the search input", async () => {
    const user = createUser();
    render(<SearchBar />);

    const input = screen.getByRole("textbox", { name: /github username/i });

    await user.type(input, "testuser");

    expect(input).toHaveValue("testuser");
  });

  it("submits search when button is clicked", async () => {
    const user = createUser();
    const mockResponse: SearchUsersResponse = {
      total_count: 1,
      incomplete_results: false,
      items: [
        {
          id: 1,
          login: "testuser",
          avatar_url: "https://example.com/avatar.jpg",
          html_url: "https://github.com/testuser",
          type: "User",
          name: "Test User",
          bio: "A test user",
          location: "Test City",
          public_repos: 10,
          followers: 5,
          following: 3,
          created_at: "2020-01-01T00:00:00Z",
        },
      ],
    };

    mockAxiosInstance.get.mockResolvedValueOnce({ data: mockResponse });

    render(<SearchBar />);

    const input = screen.getByRole("textbox", { name: /github username/i });
    const button = screen.getByRole("button", { name: /search/i });

    await user.type(input, "testuser");
    await user.click(button);

    await waitFor(() => {
      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/search/users", {
        params: {
          q: "testuser",
          per_page: 5,
          sort: "followers",
          order: "desc",
        },
      });
    });
  });

  it("submits search when Enter key is pressed", async () => {
    const user = createUser();
    const mockResponse: SearchUsersResponse = {
      total_count: 1,
      incomplete_results: false,
      items: [
        {
          id: 1,
          login: "testuser",
          avatar_url: "https://example.com/avatar.jpg",
          html_url: "https://github.com/testuser",
          type: "User",
          name: "Test User",
          bio: "A test user",
          location: "Test City",
          public_repos: 10,
          followers: 5,
          following: 3,
          created_at: "2020-01-01T00:00:00Z",
        },
      ],
    };

    mockAxiosInstance.get.mockResolvedValueOnce({ data: mockResponse });

    render(<SearchBar />);

    const input = screen.getByRole("textbox", { name: /github username/i });

    await user.type(input, "testuser");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/search/users", {
        params: {
          q: "testuser",
          per_page: 5,
          sort: "followers",
          order: "desc",
        },
      });
    });
  });

  it("shows loading state when search is in progress", async () => {
    const user = createUser();

    // Mock a slow response with manual promise control
    let resolvePromise: (value: {
      data: {
        total_count: number;
        incomplete_results: boolean;
        items: never[];
      };
    }) => void;
    const slowPromise = new Promise<{
      data: {
        total_count: number;
        incomplete_results: boolean;
        items: never[];
      };
    }>((resolve) => {
      resolvePromise = resolve;
    });

    mockAxiosInstance.get.mockReturnValueOnce(slowPromise);

    render(<SearchBar />);

    const input = screen.getByRole("textbox", { name: /github username/i });
    const button = screen.getByRole("button", { name: /search/i });

    await user.type(input, "testuser");

    // Click button to start search
    await user.click(button);

    // Wait a bit for the loading state to show
    await waitFor(() => {
      expect(screen.getByText(/searching/i)).toBeInTheDocument();
    });

    expect(button).toBeDisabled();

    // Resolve the promise
    resolvePromise!({
      data: { total_count: 0, incomplete_results: false, items: [] },
    });

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/searching/i)).not.toBeInTheDocument();
    });
  });

  it("does not submit empty search", async () => {
    const user = createUser();
    render(<SearchBar />);

    const button = screen.getByRole("button", { name: /search/i });

    await user.click(button);

    // Should not make API call
    expect(mockAxiosInstance.get).not.toHaveBeenCalled();
  });

  it("trims whitespace from search input", async () => {
    const user = createUser();
    const mockResponse: SearchUsersResponse = {
      total_count: 0,
      incomplete_results: false,
      items: [],
    };

    mockAxiosInstance.get.mockResolvedValueOnce({ data: mockResponse });

    render(<SearchBar />);

    const input = screen.getByRole("textbox", { name: /github username/i });
    const button = screen.getByRole("button", { name: /search/i });

    await user.type(input, "  testuser  ");
    await user.click(button);

    await waitFor(() => {
      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/search/users", {
        params: {
          q: "testuser",
          per_page: 5,
          sort: "followers",
          order: "desc",
        },
      });
    });
  });
});
