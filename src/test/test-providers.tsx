import React from "react";
import { GithubApiProvider } from "../contexts/GithubApiContext";

// =============================================================================
// Test Providers
// =============================================================================

interface AllTheProvidersProps {
  children: React.ReactNode;
}

// Only export the provider component to fix Fast Refresh error
export const AllTheProviders: React.FC<AllTheProvidersProps> = ({
  children,
}) => {
  return <GithubApiProvider>{children}</GithubApiProvider>;
};
