import { useContext } from "react";
import { GithubApiContext } from "../contexts/GithubApiContext";
import type { GithubApiContextType } from "../contexts/GithubApiContext";

export const useGithubApi = (): GithubApiContextType => {
  const context = useContext(GithubApiContext);
  if (context === undefined) {
    throw new Error("useGithubApi must be used within a GithubApiProvider");
  }
  return context;
};
