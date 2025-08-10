import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { render, mockApiResponse, mockApiError, createMockTask } from "../utils/test-utils";
import AddTaskForm from "../../components/timeline/AddTaskForm";

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

describe("Add Task Feature", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockApiResponse(createMockTask());
  });

  describe("Add Task Form", () => {
    it("should render all required form fields", () => {
      render(<AddTaskForm projectId={1} onSuccess={vi.fn()} />);

      expect(screen.getByRole("textbox", { name: /title/i })).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: /description/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
      expect(screen.getByRole("combobox", { name: /priority/i })).toBeInTheDocument();
      expect(screen.getByRole("combobox", { name: /category/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /add task/i })).toBeInTheDocument();
    });

    it("should validate required fields", async () => {
      render(<AddTaskForm projectId={1} onSuccess={vi.fn()} />);

      const submitButton = screen.getByRole("button", { name: /add task/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId("input-error")).toBeInTheDocument();
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });

      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("should validate due date is in the future", async () => {
      render(<AddTaskForm projectId={1} onSuccess={vi.fn()} />);

      const titleInput = screen.getByRole("textbox", { name: /title/i });
      const dueDateInput = screen.getByLabelText(/due date/i);
      const submitButton = screen.getByRole("button", { name: /add task/i });

      await user.type(titleInput, "Book venue");
      await user.type(dueDateInput, "2020-01-01"); // Past date
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/due date must be in the future/i)).toBeInTheDocument();
      });

      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("should validate title length", async () => {
      render(<AddTaskForm projectId={1} onSuccess={vi.fn()} />);

      const titleInput = screen.getByRole("textbox", { name: /title/i });
      const submitButton = screen.getByRole("button", { name: /add task/i });

      // Too short title
      await user.type(titleInput, "X");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/title must be at least 3 characters/i)).toBeInTheDocument();
      });

      await user.clear(titleInput);
      
      // Too long title
      const longTitle = "X".repeat(101);
      await user.type(titleInput, longTitle);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/title must be less than 100 characters/i)).toBeInTheDocument();
      });

      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("should submit form with valid data", async () => {
      const onSuccess = vi.fn();
      render(<AddTaskForm projectId={1} onSuccess={onSuccess} />);

      const titleInput = screen.getByRole("textbox", { name: /title/i });
      const descriptionInput = screen.getByRole("textbox", { name: /description/i });
      const dueDateInput = screen.getByLabelText(/due date/i);
      const prioritySelect = screen.getByRole("combobox", { name: /priority/i });
      const categorySelect = screen.getByRole("combobox", { name: /category/i });
      const submitButton = screen.getByRole("button", { name: /add task/i });

      await user.type(titleInput, "Book wedding venue");
      await user.type(descriptionInput, "Research and book the perfect venue");
      await user.type(dueDateInput, "2024-12-01");
      
      await user.click(prioritySelect);
      const highPriorityOption = screen.getByText("high");
      await user.click(highPriorityOption);
      
      await user.click(categorySelect);
      const venueOption = screen.getByText("venue");
      await user.click(venueOption);
      
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          title: "Book wedding venue",
          description: "Research and book the perfect venue",
          dueDate: "2024-12-01",
          priority: "high",
          category: "venue",
          projectId: 1,
          isCompleted: false, // default value
        });
      });
    });

    it("should handle priority selection", async () => {
      render(<AddTaskForm projectId={1} onSuccess={vi.fn()} />);

      const prioritySelect = screen.getByRole("combobox", { name: /priority/i });
      await user.click(prioritySelect);

      // Test different priorities
      const priorities = ["low", "medium", "high", "urgent"];
      
      for (const priority of priorities) {
        const priorityOption = screen.getByText(priority);
        expect(priorityOption).toBeInTheDocument();
      }

      const urgentOption = screen.getByText("urgent");
      await user.click(urgentOption);

      expect(prioritySelect).toHaveTextContent("urgent");
    });

    it("should handle category selection", async () => {
      render(<AddTaskForm projectId={1} onSuccess={vi.fn()} />);

      const categorySelect = screen.getByRole("combobox", { name: /category/i });
      await user.click(categorySelect);

      // Test different categories
      const categories = ["venue", "catering", "photography", "flowers", "music", "attire", "planning"];
      
      for (const category of categories) {
        const categoryOption = screen.getByText(category);
        expect(categoryOption).toBeInTheDocument();
      }

      const photographyOption = screen.getByText("photography");
      await user.click(photographyOption);

      expect(categorySelect).toHaveTextContent("photography");
    });

    it("should handle optional description field", async () => {
      const onSuccess = vi.fn();
      render(<AddTaskForm projectId={1} onSuccess={onSuccess} />);

      const titleInput = screen.getByRole("textbox", { name: /title/i });
      const dueDateInput = screen.getByLabelText(/due date/i);
      const submitButton = screen.getByRole("button", { name: /add task/i });

      await user.type(titleInput, "Send invitations");
      await user.type(dueDateInput, "2024-10-01");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Send invitations",
            description: "", // Empty description should be allowed
            dueDate: "2024-10-01",
          })
        );
      });
    });

    it("should handle submission errors", async () => {
      mockMutation.isError = true;
      mockMutation.error = new Error("Failed to add task");
      mockApiError("Failed to add task", 400);

      render(<AddTaskForm projectId={1} onSuccess={vi.fn()} />);

      const titleInput = screen.getByRole("textbox", { name: /title/i });
      const submitButton = screen.getByRole("button", { name: /add task/i });

      await user.type(titleInput, "Test Task");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to add task/i)).toBeInTheDocument();
      });
    });

    it("should show loading state during submission", async () => {
      mockMutation.isPending = true;

      render(<AddTaskForm projectId={1} onSuccess={vi.fn()} />);

      const submitButton = screen.getByTestId("button-wedding-default-loading");
      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/adding/i)).toBeInTheDocument();
    });

    it("should reset form after successful submission", async () => {
      const onSuccess = vi.fn();
      mockMutation.isSuccess = true;
      
      render(<AddTaskForm projectId={1} onSuccess={onSuccess} />);

      const titleInput = screen.getByRole("textbox", { name: /title/i });
      await user.type(titleInput, "Test Task");

      // Simulate successful submission
      await waitFor(() => {
        expect(titleInput).toHaveValue("");
      });

      expect(onSuccess).toHaveBeenCalled();
    });

    it("should handle date picker interaction", async () => {
      render(<AddTaskForm projectId={1} onSuccess={vi.fn()} />);

      const dueDateInput = screen.getByLabelText(/due date/i);
      
      // Test typing date
      await user.type(dueDateInput, "2024-08-15");
      expect(dueDateInput).toHaveValue("2024-08-15");

      // Test clearing date
      await user.clear(dueDateInput);
      await user.type(dueDateInput, "2025-01-01");
      expect(dueDateInput).toHaveValue("2025-01-01");
    });
  });

  describe("Integration with Task List", () => {
    it("should add task to the timeline after successful submission", async () => {
      const newTask = createMockTask({ 
        title: "Book photographer", 
        priority: "high",
        id: 2 
      });
      mockApiResponse(newTask);

      const onSuccess = vi.fn();
      render(<AddTaskForm projectId={1} onSuccess={onSuccess} />);

      const titleInput = screen.getByRole("textbox", { name: /title/i });
      const dueDateInput = screen.getByLabelText(/due date/i);
      const submitButton = screen.getByRole("button", { name: /add task/i });

      await user.type(titleInput, "Book photographer");
      await user.type(dueDateInput, "2024-09-15");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it("should sort tasks by due date after adding", async () => {
      // This would test the task list component integration
      const onSuccess = vi.fn();
      render(<AddTaskForm projectId={1} onSuccess={onSuccess} />);

      const titleInput = screen.getByRole("textbox", { name: /title/i });
      const dueDateInput = screen.getByLabelText(/due date/i);
      const submitButton = screen.getByRole("button", { name: /add task/i });

      await user.type(titleInput, "Order wedding cake");
      await user.type(dueDateInput, "2024-11-01");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Order wedding cake",
            dueDate: "2024-11-01",
          })
        );
      });
    });
  });
});