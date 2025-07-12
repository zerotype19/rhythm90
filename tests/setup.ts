import { vi } from 'vitest';

// Mock global fetch
vi.stubGlobal('fetch', vi.fn());

// Mock crypto for tests
vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => 'test-uuid'),
  subtle: {
    importKey: vi.fn(),
    verify: vi.fn(),
    digest: vi.fn()
  }
});

// Mock console methods to reduce noise in tests
vi.stubGlobal('console', {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
}); 