import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { render, mockApiResponse, mockApiError, createMockGuest } from "../utils/test-utils";
import AddGuestForm from "../../components/guests/AddGuestForm";

// Mock the form submission hook
const mockMutate = vi.fn();
const mockMutation = {
  mutate: mockMutate,
  isPending: false,
  error: null,
  isSuccess: false,
  isError: false,
};

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useMutation: vi.fn(() => mockMutation),
    useQueryClient: vi.fn(() => ({
      invalidateQueries: vi.fn(),
    })),
  };
});

describe("Add Guest Feature", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockApiResponse(createMockGuest());
  });

  describe("Add Guest Form", () => {
    it("should render all required form fields", () => {
      render(<AddGuestForm projectId={1} onSuccess={vi.fn()} />);

      expect(screen.getByTestId("input-default-default")).toBeInTheDocument(); // name field
      expect(screen.getByRole("textbox", { name: /name/i })).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: /phone/i })).toBeInTheDocument();
      expect(screen.getByRole("combobox", { name: /group/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /add guest/i })).toBeInTheDocument();
    });

    it("should validate required fields", async () => {
      render(<AddGuestForm projectId={1} onSuccess={vi.fn()} />);

      const submitButton = screen.getByRole("button", { name: /add guest/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId("input-error")).toBeInTheDocument();
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });

      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("should validate email format", async () => {
      render(<AddGuestForm projectId={1} onSuccess={vi.fn()} />);

      const nameInput = screen.getByRole("textbox", { name: /name/i });
      const emailInput = screen.getByRole("textbox", { name: /email/i });
      const submitButton = screen.getByRole("button", { name: /add guest/i });

      await user.type(nameInput, "John Doe");
      await user.type(emailInput, "invalid-email");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });

      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("should validate phone number format", async () => {
      render(<AddGuestForm projectId={1} onSuccess={vi.fn()} />);

      const nameInput = screen.getByRole("textbox", { name: /name/i });
      const phoneInput = screen.getByRole("textbox", { name: /phone/i });
      const submitButton = screen.getByRole("button", { name: /add guest/i });

      await user.type(nameInput, "John Doe");
      await user.type(phoneInput, "123"); // Invalid phone
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid phone number format/i)).toBeInTheDocument();
      });

      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("should submit form with valid data", async () => {
      const onSuccess = vi.fn();
      render(<AddGuestForm projectId={1} onSuccess={onSuccess} />);

      const nameInput = screen.getByRole("textbox", { name: /name/i });
      const emailInput = screen.getByRole("textbox", { name: /email/i });
      const phoneInput = screen.getByRole("textbox", { name: /phone/i });
      const submitButton = screen.getByRole("button", { name: /add guest/i });

      await user.type(nameInput, "John Doe");
      await user.type(emailInput, "john@example.com");
      await user.type(phoneInput, "+1234567890");
      
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          name: "John Doe",
          email: "john@example.com",
          phone: "+1234567890",
          projectId: 1,
          group: "family", // default value
          partySize: 1, // default value
          rsvpStatus: "pending", // default value
        });
      });
    });

    it("should handle submission errors", async () => {
      mockMutation.isError = true;
      mockMutation.error = new Error("Failed to add guest");
      mockApiError("Failed to add guest", 400);

      render(<AddGuestForm projectId={1} onSuccess={vi.fn()} />);

      const nameInput = screen.getByRole("textbox", { name: /name/i });
      const submitButton = screen.getByRole("button", { name: /add guest/i });

      await user.type(nameInput, "John Doe");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to add guest/i)).toBeInTheDocument();
      });
    });

    it("should show loading state during submission", async () => {
      mockMutation.isPending = true;

      render(<AddGuestForm projectId={1} onSuccess={vi.fn()} />);

      const submitButton = screen.getByTestId("button-wedding-default-loading");
      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/adding/i)).toBeInTheDocument();
    });

    it("should reset form after successful submission", async () => {
      const onSuccess = vi.fn();
      mockMutation.isSuccess = true;
      
      render(<AddGuestForm projectId={1} onSuccess={onSuccess} />);

      const nameInput = screen.getByRole("textbox", { name: /name/i });
      await user.type(nameInput, "John Doe");

      // Simulate successful submission
      await waitFor(() => {
        expect(nameInput).toHaveValue("");
      });

      expect(onSuccess).toHaveBeenCalled();
    });

    it("should handle party size changes", async () => {
      render(<AddGuestForm projectId={1} onSuccess={vi.fn()} />);

      const partySizeInput = screen.getByRole("spinbutton", { name: /party size/i });
      await user.clear(partySizeInput);
      await user.type(partySizeInput, "3");

      expect(partySizeInput).toHaveValue(3);
    });

    it("should handle group selection", async () => {
      render(<AddGuestForm projectId={1} onSuccess={vi.fn()} />);

      const groupSelect = screen.getByRole("combobox", { name: /group/i });
      await user.click(groupSelect);

      const friendsOption = screen.getByText("friends");
      await user.click(friendsOption);

      expect(groupSelect).toHaveTextContent("friends");
    });
  });

  describe("Integration with Guest List", () => {
    it("should add guest to the list after successful submission", async () => {
      const newGuest = createMockGuest({ name: "Jane Smith", id: 2 });
      mockApiResponse(newGuest);

      const onSuccess = vi.fn();
      render(<AddGuestForm projectId={1} onSuccess={onSuccess} />);

      const nameInput = screen.getByRole("textbox", { name: /name/i });
      const submitButton = screen.getByRole("button", { name: /add guest/i });

      await user.type(nameInput, "Jane Smith");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
        expect(onSuccess).toHaveBeenCalled();
      });
    });
  });
});