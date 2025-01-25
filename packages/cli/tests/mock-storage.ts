import { vi } from "vitest";

// Types
interface MockStorage {
  clear(): void;
  set(files: Record<string, string>): void;
}

// Global storage type
declare global {
  var __mockStorage: Record<string, string>;
}

// Initialize global storage
globalThis.__mockStorage = {};

// Create mock storage singleton
export const mockStorage: MockStorage = {
  clear: () => {
    globalThis.__mockStorage = {};
  },
  set: (files: Record<string, string>) => {
    mockStorage.clear();
    Object.entries(files).forEach(([path, content]) => {
      const fullPath = `${process.cwd()}/${path}`;
      globalThis.__mockStorage[fullPath] = content;
    });
  },
};

// Setup fs mock
vi.mock("fs/promises", () => ({
  default: {
    readFile: vi.fn(async (path: string) => {
      const content = globalThis.__mockStorage[path];
      if (!content) throw new Error(`File not found: ${path}`);
      return content;
    }),
    writeFile: vi.fn((path, content) => {
      globalThis.__mockStorage[path] = content;
      return Promise.resolve();
    }),
    mkdir: vi.fn(),
    access: vi.fn((path) => {
      return globalThis.__mockStorage[path] ? Promise.resolve() : Promise.reject(new Error("ENOENT"));
    }),
  },
}));
