import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";

// Mock router
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock("wouter", () => ({
  useLocation: () => ["/", mockPush],
  useRoute: () => [true, {}],
  Link: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  Router: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Test wrapper with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Mock API responses
export const mockApiResponse = (data: any, status = 200) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as Response);
};

export const mockApiError = (error: string, status = 500) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: async () => ({ error }),
    text: async () => JSON.stringify({ error }),
  } as Response);
};

// Helper to create mock user data
export const createMockUser = (overrides = {}) => ({
  id: 1,
  username: "Test User",
  email: "test@example.com",
  avatar: null,
  hasCompletedIntake: true,
  ...overrides,
});

// Helper to create mock project data
export const createMockProject = (overrides = {}) => ({
  id: 1,
  name: "Test Wedding",
  date: "2024-12-31",
  venue: "Test Venue",
  userId: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// Helper to create mock guest data
export const createMockGuest = (overrides = {}) => ({
  id: 1,
  projectId: 1,
  name: "John Doe",
  email: "john@example.com",
  phone: "+1234567890",
  address: "123 Main St",
  group: "family",
  rsvpStatus: "pending",
  partySize: 1,
  dietaryRestrictions: "",
  notes: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// Helper to create mock expense data
export const createMockExpense = (overrides = {}) => ({
  id: 1,
  projectId: 1,
  category: "venue",
  description: "Wedding Venue",
  amount: 5000,
  vendor: "Test Venue Co",
  date: new Date().toISOString(),
  isPaid: false,
  notes: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// Helper to create mock task data
export const createMockTask = (overrides = {}) => ({
  id: 1,
  projectId: 1,
  title: "Book venue",
  description: "Find and book the perfect wedding venue",
  dueDate: "2024-06-01",
  priority: "high",
  category: "venue",
  isCompleted: false,
  completedAt: null,
  assignedTo: null,
  notes: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export * from "@testing-library/react";
export { customRender as render };