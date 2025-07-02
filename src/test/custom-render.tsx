import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";
import { AllTheProviders } from "./test-providers";

// Custom render method that wraps components with test providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export { customRender as render };
