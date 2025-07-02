import { useContext } from "react";
import {
  GithubApiContext,
  type GithubApiContextType,
} from "../contexts/GithubApiContext";

export const useGithubApi = (): GithubApiContextType => {
  const context = useContext(GithubApiContext);
  if (context === undefined) {
    throw new Error("useGithubApi must be used within a GithubApiProvider");
  }
  return context;
};
