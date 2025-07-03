import "@testing-library/jest-dom";
import { vi, beforeEach, afterEach } from "vitest";

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

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.open for repository link tests
Object.defineProperty(window, "open", {
  writable: true,
  value: vi.fn(),
});

// Global beforeEach to clear mocks
beforeEach(() => {
  vi.clearAllMocks();
});

// Global afterEach to clear timers
afterEach(() => {
  vi.clearAllTimers();
});

// Mock axios globally
export const mockAxiosInstance = {
  get: vi.fn(() => Promise.resolve({ data: {} })),
  post: vi.fn(() => Promise.resolve({ data: {} })),
  put: vi.fn(() => Promise.resolve({ data: {} })),
  delete: vi.fn(() => Promise.resolve({ data: {} })),
};

// Mock axios error handling
export const mockAxios = {
  create: vi.fn(() => mockAxiosInstance),
  isAxiosError: vi.fn(() => false),
};

vi.mock("axios", () => ({
  default: mockAxios,
  ...mockAxios,
}));
