import { z } from "zod";

// Task Schema
export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  category: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.string().optional(),
  assignedTo: z.string().max(50, "Assigned to must be less than 50 characters").optional(),
  isCompleted: z.boolean().default(false),
});

export type TaskFormData = z.infer<typeof taskSchema>;

// Budget Schema
export const budgetSchema = z.object({
  category: z.string().min(1, "Category is required"),
  item: z.string().min(1, "Item name is required").max(100, "Item name must be less than 100 characters"),
  estimatedCost: z.number().min(0, "Estimated cost must be positive"),
  actualCost: z.number().min(0, "Actual cost must be positive").optional(),
  vendor: z.string().max(100, "Vendor name must be less than 100 characters").optional(),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional(),
  isPaid: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
});

export type BudgetFormData = z.infer<typeof budgetSchema>;

// Guest Schema
export const guestSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().max(20, "Phone number must be less than 20 characters").optional(),
  group: z.string().min(1, "Group is required"),
  customGroup: z.string().max(50, "Custom group must be less than 50 characters").optional(),
  rsvpStatus: z.enum(["pending", "yes", "no", "maybe"]).default("pending"),
  partySize: z.number().min(1, "Party size must be at least 1").max(15, "Party size cannot exceed 15").default(1),
  mealChoice: z.string().optional(),
  dietaryRestrictions: z.string().max(200, "Dietary restrictions must be less than 200 characters").optional(),
  hotelInfo: z.string().max(200, "Hotel info must be less than 200 characters").optional(),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional(),
  tags: z.string().max(100, "Tags must be less than 100 characters").optional(),
  inviteSent: z.boolean().default(false),
});

export type GuestFormData = z.infer<typeof guestSchema>;

// Vendor Schema
export const vendorSchema = z.object({
  name: z.string().min(1, "Vendor name is required").max(100, "Vendor name must be less than 100 characters"),
  type: z.string().min(1, "Vendor type is required"),
  contactPerson: z.string().max(100, "Contact person must be less than 100 characters").optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().max(20, "Phone number must be less than 20 characters").optional(),
  website: z.string().max(200, "Website URL must be less than 200 characters").optional(),
  address: z.string().max(200, "Address must be less than 200 characters").optional(),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional(),
  tags: z.string().max(100, "Tags must be less than 100 characters").optional(),
  rating: z.number().min(1).max(5).optional(),
  estimatedCost: z.number().min(0, "Cost must be positive").optional(),
  isBooked: z.boolean().default(false),
});

export type VendorFormData = z.infer<typeof vendorSchema>;

// Inspiration Schema
export const inspirationSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  imageUrl: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().max(100, "Tags must be less than 100 characters").optional(),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional(),
  source: z.string().max(200, "Source must be less than 200 characters").optional(),
});

export type InspirationFormData = z.infer<typeof inspirationSchema>;

// Schedule Schema
export const scheduleSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  location: z.string().max(200, "Location must be less than 200 characters").optional(),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional(),
});

export type ScheduleFormData = z.infer<typeof scheduleSchema>;

// Common validation patterns
export const emailValidation = z.string().email("Invalid email address").optional().or(z.literal(""));
export const phoneValidation = z.string().max(20, "Phone number must be less than 20 characters").optional();
export const urlValidation = z.string().max(200, "URL must be less than 200 characters").optional();
export const textValidation = (maxLength: number, fieldName: string) => 
  z.string().max(maxLength, `${fieldName} must be less than ${maxLength} characters`).optional();
export const requiredTextValidation = (maxLength: number, fieldName: string) => 
  z.string().min(1, `${fieldName} is required`).max(maxLength, `${fieldName} must be less than ${maxLength} characters`);