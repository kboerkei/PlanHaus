import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render, mockUser } from './utils';
import { AddGuestForm } from '@/components/guests/AddGuestForm';

// Mock the API request
const mockApiRequest = vi.fn();
vi.mock('@/lib/queryClient', () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
  },
  apiRequest: mockApiRequest,
}));

// Mock the toast hook
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

describe('AddGuestForm', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(<AddGuestForm onSuccess={mockOnSuccess} />);

    expect(screen.getByLabelText(/guest name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/party size/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/rsvp status/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add guest/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty required fields', async () => {
    render(<AddGuestForm onSuccess={mockOnSuccess} />);

    const submitButton = screen.getByRole('button', { name: /add guest/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const mockGuestData = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      partySize: 2,
      rsvpStatus: 'pending',
    };

    mockApiRequest.mockResolvedValueOnce(mockGuestData);

    render(<AddGuestForm onSuccess={mockOnSuccess} />);

    // Fill out form
    fireEvent.change(screen.getByLabelText(/guest name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/party size/i), {
      target: { value: '2' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /add guest/i }));

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith('/api/guests', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          partySize: 2,
          rsvpStatus: 'pending',
          dietaryRestrictions: '',
        }),
      });
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Guest added successfully',
    });
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('handles API errors gracefully', async () => {
    mockApiRequest.mockRejectedValueOnce(new Error('Network error'));

    render(<AddGuestForm onSuccess={mockOnSuccess} />);

    fireEvent.change(screen.getByLabelText(/guest name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.click(screen.getByRole('button', { name: /add guest/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to add guest. Please try again.',
        variant: 'destructive',
      });
    });
  });

  it('shows loading state during submission', async () => {
    // Mock a delayed API response
    mockApiRequest.mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<AddGuestForm onSuccess={mockOnSuccess} />);

    fireEvent.change(screen.getByLabelText(/guest name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.click(screen.getByRole('button', { name: /add guest/i }));

    // Check loading state
    expect(screen.getByRole('button', { name: /adding.../i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /adding.../i })).toBeDisabled();
  });
});