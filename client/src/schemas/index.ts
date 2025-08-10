import { z } from "zod";

// Common validation patterns
export const phoneRegex = /^[\+]?[(]?[\d\s\-\(\)]{10,}$/;
export const urlRegex = /^https?:\/\/.+/;

// Reusable field schemas
export const emailField = z.string().email("Please enter a valid email address").or(z.literal(""));
export const phoneField = z.string().regex(phoneRegex, "Please enter a valid phone number").or(z.literal(""));
export const urlField = z.string().url("Please enter a valid URL").or(z.literal(""));
export const requiredText = (fieldName: string) => z.string().min(1, `${fieldName} is required`);
export const optionalText = z.string().optional();
export const positiveNumber = z.number().positive("Must be a positive number");
export const nonNegativeNumber = z.number().min(0, "Must be 0 or greater");

// Task/Timeline form schema
export const taskSchema = z.object({
  title: requiredText("Title"),
  description: optionalText,
  dueDate: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  category: z.enum([
    "planning", "venue", "catering", "photography", "flowers", 
    "music", "attire", "invitations", "decorations", "other"
  ]).default("planning"),
  assignedTo: optionalText,
  status: z.enum(["not_started", "in_progress", "completed", "cancelled"]).default("not_started"),
  isCompleted: z.boolean().default(false),
  notes: optionalText,
  estimatedHours: z.number().min(0).optional(),
  actualHours: z.number().min(0).optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;

// Budget form schema
export const budgetItemSchema = z.object({
  category: requiredText("Category"),
  item: requiredText("Item"),
  estimatedCost: positiveNumber.optional(),
  actualCost: nonNegativeNumber.optional(),
  vendor: optionalText,
  notes: optionalText,
  isPaid: z.boolean().default(false),
  paymentDue: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  status: z.enum(["planned", "quoted", "booked", "paid", "cancelled"]).default("planned"),
});

export type BudgetItemFormData = z.infer<typeof budgetItemSchema>;

// Guest form schema
export const guestSchema = z.object({
  name: requiredText("Name"),
  email: emailField,
  phone: phoneField,
  group: z.enum([
    "bride_family", "groom_family", "bride_friends", "groom_friends", 
    "work_colleagues", "other"
  ]).default("other"),
  customGroup: optionalText,
  rsvpStatus: z.enum(["pending", "attending", "not_attending", "maybe"]).default("pending"),
  partySize: z.number().min(1, "Party size must be at least 1").default(1),
  mealChoice: optionalText,
  dietaryRestrictions: optionalText,
  hotelInfo: optionalText,
  notes: optionalText,
  tags: optionalText,
  inviteSent: z.boolean().default(false),
  plusOneAllowed: z.boolean().default(true),
  address: optionalText,
  relationship: optionalText,
});

export type GuestFormData = z.infer<typeof guestSchema>;

// Vendor form schema
export const vendorSchema = z.object({
  name: requiredText("Name"),
  category: z.enum([
    "venue", "catering", "photography", "videography", "music", 
    "flowers", "cake", "transportation", "attire", "beauty", 
    "officiant", "planning", "other"
  ]).default("other"),
  email: emailField,
  phone: phoneField,
  website: urlField,
  address: optionalText,
  contactPerson: optionalText,
  priceRange: optionalText,
  bookingStatus: z.enum([
    "researching", "contacted", "quoted", "meeting_scheduled", 
    "proposal_received", "booked", "paid", "cancelled"
  ]).default("researching"),
  rating: z.number().min(0).max(5).default(0),
  notes: optionalText,
  isBooked: z.boolean().default(false),
  contractSigned: z.boolean().default(false),
  depositPaid: z.boolean().default(false),
  finalPaymentDue: z.string().optional(),
  services: optionalText,
  portfolio: optionalText,
});

export type VendorFormData = z.infer<typeof vendorSchema>;

// Inspiration form schema
export const inspirationSchema = z.object({
  title: requiredText("Title"),
  category: z.enum([
    "venue", "decorations", "flowers", "cake", "attire", 
    "photography", "invitations", "favors", "other"
  ]).default("other"),
  imageUrl: urlField,
  notes: optionalText,
  tags: optionalText,
  source: optionalText,
  cost: nonNegativeNumber.optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  status: z.enum(["saved", "considering", "decided", "ordered", "completed"]).default("saved"),
});

export type InspirationFormData = z.infer<typeof inspirationSchema>;

// Project/Wedding details schema
export const projectSchema = z.object({
  name: requiredText("Wedding Name"),
  date: z.string().min(1, "Wedding date is required"),
  venue: optionalText,
  theme: optionalText,
  budget: positiveNumber.optional(),
  guestCount: z.number().min(1, "Guest count must be at least 1").optional(),
  style: optionalText,
  description: optionalText,
  ceremonyTime: z.string().optional(),
  receptionTime: z.string().optional(),
  colors: optionalText,
  season: z.enum(["spring", "summer", "fall", "winter"]).optional(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

// User profile schema
export const profileSchema = z.object({
  username: requiredText("Username"),
  email: z.string().email("Please enter a valid email address"),
  firstName: optionalText,
  lastName: optionalText,
  avatar: optionalText,
  phone: phoneField,
  timezone: optionalText,
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false),
  }).default({
    email: true,
    push: true,
    sms: false,
  }),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Intake form schema (simplified for key fields)
export const intakeSchema = z.object({
  partner1FirstName: requiredText("Your first name"),
  partner2FirstName: requiredText("Partner's first name"),
  weddingDate: z.string().min(1, "Wedding date is required"),
  venue: optionalText,
  estimatedGuests: z.number().min(1, "Number of guests must be at least 1"),
  budget: positiveNumber.optional(),
  planningPriorities: z.array(z.string()).default([]),
  weddingStyle: optionalText,
  theme: optionalText,
  concerns: optionalText,
  timeline: optionalText,
});

export type IntakeFormData = z.infer<typeof intakeSchema>;