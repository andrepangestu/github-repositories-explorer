import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock Clipboard API with proper configuration
if (!navigator.clipboard) {
  Object.defineProperty(navigator, "clipboard", {
    value: {
      writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      readText: vi.fn().mockImplementation(() => Promise.resolve("")),
    },
    writable: true,
    configurable: true, // This is important - allows redefining
  });
}

// Mock other navigator properties that might be needed
Object.defineProperty(navigator, "userAgent", {
  value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  writable: true,
  configurable: true,
});

// Add vi to global scope for tests
declare global {
  const vi: typeof import("vitest").vi;
}
