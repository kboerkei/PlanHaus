import { z } from "zod";

// Task schema
export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be under 100 characters"),
  description: z.string().max(500, "Description must be under 500 characters").optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  category: z.enum(["venue", "catering", "photography", "flowers", "music", "attire", "planning", "other"]).default("planning"),
  assignedTo: z.string().optional(),
  isCompleted: z.boolean().default(false),
});

// Vendor schema
export const vendorSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  type: z.enum(["venue", "catering", "photography", "flowers", "music", "planning", "transportation", "other"]),
  contactPerson: z.string().max(100, "Contact person must be under 100 characters").optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(20, "Phone must be under 20 characters").optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  address: z.string().max(200, "Address must be under 200 characters").optional(),
  notes: z.string().max(500, "Notes must be under 500 characters").optional(),
  tags: z.string().max(200, "Tags must be under 200 characters").optional(),
  rating: z.number().min(1).max(5).optional(),
  estimatedCost: z.number().min(0).optional(),
  isBooked: z.boolean().default(false),
});

// Budget schema
export const budgetSchema = z.object({
  category: z.enum(["venue", "catering", "photography", "flowers", "music", "attire", "transportation", "other"]),
  item: z.string().min(1, "Item is required").max(100, "Item must be under 100 characters"),
  estimatedCost: z.number().min(0, "Cost must be positive"),
  actualCost: z.number().min(0, "Cost must be positive").optional(),
  vendor: z.string().max(100, "Vendor must be under 100 characters").optional(),
  notes: z.string().max(300, "Notes must be under 300 characters").optional(),
  isPaid: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
});

// Guest schema
export const guestSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(20, "Phone must be under 20 characters").optional(),
  group: z.enum(["family", "friends", "coworkers", "wedding_party", "plus_ones", "other"]).default("friends"),
  customGroup: z.string().max(50, "Custom group must be under 50 characters").optional(),
  rsvpStatus: z.enum(["pending", "yes", "no", "maybe"]).default("pending"),
  attendingCount: z.number().min(0).max(10).default(1),
  mealChoice: z.enum(["chicken", "beef", "fish", "vegetarian", "vegan", "other"]).optional(),
  dietaryRestrictions: z.string().max(200, "Dietary restrictions must be under 200 characters").optional(),
  hotelInfo: z.string().max(200, "Hotel info must be under 200 characters").optional(),
  notes: z.string().max(300, "Notes must be under 300 characters").optional(),
  tags: z.string().max(100, "Tags must be under 100 characters").optional(),
  inviteSent: z.boolean().default(false),
});

// Inspiration schema
export const inspirationSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be under 100 characters"),
  category: z.enum(["decor", "flowers", "venues", "dresses", "cakes", "colors", "themes", "other"]).default("other"),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  notes: z.string().max(500, "Notes must be under 500 characters").optional(),
  tags: z.string().max(200, "Tags must be under 200 characters").optional(),
});

// Type exports
export type TaskFormData = z.infer<typeof taskSchema>;
export type VendorFormData = z.infer<typeof vendorSchema>;
export type BudgetFormData = z.infer<typeof budgetSchema>;
export type GuestFormData = z.infer<typeof guestSchema>;
export type InspirationFormData = z.infer<typeof inspirationSchema>;