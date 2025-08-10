import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ReactElement } from 'react';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Mock data factories
export const mockUser = {
  id: 1,
  username: 'Test User',
  email: 'test@example.com',
  avatar: null,
  hasCompletedIntake: true,
};

export const mockProject = {
  id: 1,
  name: 'Test Wedding',
  date: '2024-06-15',
  userId: 1,
};

export const mockGuest = {
  id: 1,
  projectId: 1,
  name: 'John Doe',
  email: 'john@example.com',
  partySize: 1,
  rsvpStatus: 'pending' as const,
  dietaryRestrictions: null,
};

export const mockExpense = {
  id: 1,
  projectId: 1,
  category: 'venue',
  description: 'Test Venue',
  amount: 5000,
  paid: false,
  dueDate: '2024-05-01',
};

export const mockTask = {
  id: 1,
  projectId: 1,
  title: 'Test Task',
  description: 'Test task description',
  category: 'planning',
  priority: 'medium' as const,
  completed: false,
  dueDate: '2024-04-01',
};