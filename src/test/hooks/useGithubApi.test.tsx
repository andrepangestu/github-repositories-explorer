import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useGithubApi } from "../../hooks/useGithubApi";
import { GithubApiProvider } from "../../contexts/GithubApiContext";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <GithubApiProvider>{children}</GithubApiProvider>
);

describe("useGithubApi Hook", () => {
  it("returns context value when used within provider", () => {
    const { result } = renderHook(() => useGithubApi(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.state).toBeDefined();
    expect(typeof result.current.fetchUsers).toBe("function");
    expect(typeof result.current.fetchRepos).toBe("function");
    expect(typeof result.current.selectUser).toBe("function");
    expect(typeof result.current.setSearchQuery).toBe("function");
    expect(typeof result.current.triggerSearch).toBe("function");
    expect(typeof result.current.clearSearch).toBe("function");
  });

  it("throws error when used outside provider", () => {
    expect(() => {
      renderHook(() => useGithubApi());
    }).toThrow("useGithubApi must be used within a GithubApiProvider");
  });
});
