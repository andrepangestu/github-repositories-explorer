import { useContext } from "react";
import { GitHubApiContext } from "../contexts/GitHubApiContext";
import type { GitHubApiContextType } from "../contexts/GitHubApiContext";

export const useGitHubApi = (): GitHubApiContextType => {
  const context = useContext(GitHubApiContext);
  if (context === undefined) {
    throw new Error("useGitHubApi must be used within a GitHubApiProvider");
  }
  return context;
};
