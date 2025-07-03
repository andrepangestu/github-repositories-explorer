import React from "react";
import { GithubApiProvider } from "../contexts/GithubApiContext";

interface AllTheProvidersProps {
  children: React.ReactNode;
}

export const AllTheProviders: React.FC<AllTheProvidersProps> = ({
  children,
}) => {
  return <GithubApiProvider>{children}</GithubApiProvider>;
};
