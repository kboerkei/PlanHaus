import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { render, mockApiResponse, mockApiError, createMockExpense } from "../utils/test-utils";
import AddExpenseForm from "../../components/budget/AddExpenseForm";

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

describe("Add Expense Feature", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockApiResponse(createMockExpense());
  });

  describe("Add Expense Form", () => {
    it("should render all required form fields", () => {
      render(<AddExpenseForm projectId={1} onSuccess={vi.fn()} />);

      expect(screen.getByRole("textbox", { name: /description/i })).toBeInTheDocument();
      expect(screen.getByRole("spinbutton", { name: /amount/i })).toBeInTheDocument();
      expect(screen.getByRole("combobox", { name: /category/i })).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: /vendor/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /add expense/i })).toBeInTheDocument();
    });

    it("should validate required fields", async () => {
      render(<AddExpenseForm projectId={1} onSuccess={vi.fn()} />);

      const submitButton = screen.getByRole("button", { name: /add expense/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId("input-error")).toBeInTheDocument();
        expect(screen.getByText(/description is required/i)).toBeInTheDocument();
      });

      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("should validate amount is positive", async () => {
      render(<AddExpenseForm projectId={1} onSuccess={vi.fn()} />);

      const descriptionInput = screen.getByRole("textbox", { name: /description/i });
      const amountInput = screen.getByRole("spinbutton", { name: /amount/i });
      const submitButton = screen.getByRole("button", { name: /add expense/i });

      await user.type(descriptionInput, "Wedding Venue");
      await user.clear(amountInput);
      await user.type(amountInput, "-100");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/amount must be greater than 0/i)).toBeInTheDocument();
      });

      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("should validate amount is not excessive", async () => {
      render(<AddExpenseForm projectId={1} onSuccess={vi.fn()} />);

      const descriptionInput = screen.getByRole("textbox", { name: /description/i });
      const amountInput = screen.getByRole("spinbutton", { name: /amount/i });
      const submitButton = screen.getByRole("button", { name: /add expense/i });

      await user.type(descriptionInput, "Wedding Venue");
      await user.clear(amountInput);
      await user.type(amountInput, "999999999");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/amount is too large/i)).toBeInTheDocument();
      });

      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("should submit form with valid data", async () => {
      const onSuccess = vi.fn();
      render(<AddExpenseForm projectId={1} onSuccess={onSuccess} />);

      const descriptionInput = screen.getByRole("textbox", { name: /description/i });
      const amountInput = screen.getByRole("spinbutton", { name: /amount/i });
      const vendorInput = screen.getByRole("textbox", { name: /vendor/i });
      const categorySelect = screen.getByRole("combobox", { name: /category/i });
      const submitButton = screen.getByRole("button", { name: /add expense/i });

      await user.type(descriptionInput, "Wedding Venue Deposit");
      await user.clear(amountInput);
      await user.type(amountInput, "5000");
      await user.type(vendorInput, "Grand Ballroom Co");
      
      await user.click(categorySelect);
      const venueOption = screen.getByText("venue");
      await user.click(venueOption);
      
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          description: "Wedding Venue Deposit",
          amount: 5000,
          vendor: "Grand Ballroom Co",
          category: "venue",
          projectId: 1,
          isPaid: false, // default value
          date: expect.any(String),
        });
      });
    });

    it("should handle category selection", async () => {
      render(<AddExpenseForm projectId={1} onSuccess={vi.fn()} />);

      const categorySelect = screen.getByRole("combobox", { name: /category/i });
      await user.click(categorySelect);

      // Test different categories
      const categories = ["venue", "catering", "photography", "flowers", "music", "other"];
      
      for (const category of categories) {
        const categoryOption = screen.getByText(category);
        expect(categoryOption).toBeInTheDocument();
      }

      const cateringOption = screen.getByText("catering");
      await user.click(cateringOption);

      expect(categorySelect).toHaveTextContent("catering");
    });

    it("should handle paid status toggle", async () => {
      render(<AddExpenseForm projectId={1} onSuccess={vi.fn()} />);

      const paidCheckbox = screen.getByRole("checkbox", { name: /paid/i });
      expect(paidCheckbox).not.toBeChecked();

      await user.click(paidCheckbox);
      expect(paidCheckbox).toBeChecked();
    });

    it("should handle date selection", async () => {
      render(<AddExpenseForm projectId={1} onSuccess={vi.fn()} />);

      const dateInput = screen.getByLabelText(/date/i);
      await user.type(dateInput, "2024-06-15");

      expect(dateInput).toHaveValue("2024-06-15");
    });

    it("should handle submission errors", async () => {
      mockMutation.isError = true;
      mockMutation.error = new Error("Failed to add expense");
      mockApiError("Failed to add expense", 400);

      render(<AddExpenseForm projectId={1} onSuccess={vi.fn()} />);

      const descriptionInput = screen.getByRole("textbox", { name: /description/i });
      const submitButton = screen.getByRole("button", { name: /add expense/i });

      await user.type(descriptionInput, "Test Expense");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to add expense/i)).toBeInTheDocument();
      });
    });

    it("should show loading state during submission", async () => {
      mockMutation.isPending = true;

      render(<AddExpenseForm projectId={1} onSuccess={vi.fn()} />);

      const submitButton = screen.getByTestId("button-wedding-default-loading");
      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/adding/i)).toBeInTheDocument();
    });

    it("should reset form after successful submission", async () => {
      const onSuccess = vi.fn();
      mockMutation.isSuccess = true;
      
      render(<AddExpenseForm projectId={1} onSuccess={onSuccess} />);

      const descriptionInput = screen.getByRole("textbox", { name: /description/i });
      await user.type(descriptionInput, "Test Expense");

      // Simulate successful submission
      await waitFor(() => {
        expect(descriptionInput).toHaveValue("");
      });

      expect(onSuccess).toHaveBeenCalled();
    });

    it("should format currency input properly", async () => {
      render(<AddExpenseForm projectId={1} onSuccess={vi.fn()} />);

      const amountInput = screen.getByRole("spinbutton", { name: /amount/i });
      
      await user.clear(amountInput);
      await user.type(amountInput, "1234.56");

      expect(amountInput).toHaveValue(1234.56);
    });
  });

  describe("Integration with Budget List", () => {
    it("should add expense to the budget after successful submission", async () => {
      const newExpense = createMockExpense({ 
        description: "Photographer", 
        amount: 3000,
        id: 2 
      });
      mockApiResponse(newExpense);

      const onSuccess = vi.fn();
      render(<AddExpenseForm projectId={1} onSuccess={onSuccess} />);

      const descriptionInput = screen.getByRole("textbox", { name: /description/i });
      const amountInput = screen.getByRole("spinbutton", { name: /amount/i });
      const submitButton = screen.getByRole("button", { name: /add expense/i });

      await user.type(descriptionInput, "Photographer");
      await user.clear(amountInput);
      await user.type(amountInput, "3000");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it("should update budget totals after adding expense", async () => {
      // This would typically test the budget summary component
      // integration after adding a new expense
      const onSuccess = vi.fn();
      render(<AddExpenseForm projectId={1} onSuccess={onSuccess} />);

      const descriptionInput = screen.getByRole("textbox", { name: /description/i });
      const amountInput = screen.getByRole("spinbutton", { name: /amount/i });
      const submitButton = screen.getByRole("button", { name: /add expense/i });

      await user.type(descriptionInput, "Wedding Cake");
      await user.clear(amountInput);
      await user.type(amountInput, "800");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            description: "Wedding Cake",
            amount: 800,
          })
        );
      });
    });
  });
});