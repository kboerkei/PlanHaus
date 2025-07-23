import { z } from "zod";

// Step 1: Event Details Schema
export const eventDetailsSchema = z.object({
  partner1FirstName: z.string().min(1, "First name is required"),
  partner1LastName: z.string().min(1, "Last name is required"),
  partner1Email: z.string().email("Please enter a valid email"),
  partner2FirstName: z.string().min(1, "Partner's first name is required"),
  partner2LastName: z.string().optional(),
  partner2Email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  weddingDate: z.date({ required_error: "Wedding date is required" }),
  ceremonyLocation: z.string().min(1, "Ceremony location is required"),
  receptionLocation: z.string().optional(),
  estimatedGuests: z.number().min(1, "Please enter at least 1 guest"),
});

// Step 2: Style Preferences Schema
export const stylePreferencesSchema = z.object({
  overallVibe: z.string().min(1, "Please select your wedding vibe"),
  colorPalette: z.string().optional(),
  mustHaveElements: z.array(z.string()).default([]),
  pinterestBoards: z.array(z.string().url("Please enter valid URLs")).default([]),
});

// Step 3: Budget Estimate Schema
export const budgetEstimateSchema = z.object({
  totalBudget: z.number().min(1000, "Budget must be at least $1,000"),
  topPriorities: z.array(z.string()).max(3, "Please select up to 3 priorities"),
  nonNegotiables: z.string().optional(),
});

// Combined Schema for the entire form
export const intakeWizardSchema = z.object({
  eventDetails: eventDetailsSchema,
  stylePreferences: stylePreferencesSchema,
  budgetEstimate: budgetEstimateSchema,
});

export type EventDetailsData = z.infer<typeof eventDetailsSchema>;
export type StylePreferencesData = z.infer<typeof stylePreferencesSchema>;
export type BudgetEstimateData = z.infer<typeof budgetEstimateSchema>;
export type IntakeWizardData = z.infer<typeof intakeWizardSchema>;

// Step interface
export interface StepProps {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

// Wedding vibe options
export const weddingVibes = [
  "Romantic & Classic",
  "Boho & Rustic", 
  "Modern & Minimalist",
  "Vintage & Retro",
  "Garden & Natural",
  "Glamorous & Luxury",
  "Beach & Coastal",
  "Industrial & Urban",
  "Whimsical & Fun",
  "Traditional & Formal"
];

// Priority options
export const priorityOptions = [
  "Venue",
  "Photography", 
  "Food & Catering",
  "Music & Entertainment",
  "Flowers & Decor",
  "Wedding Dress",
  "Overall Vibe",
  "Budget Management",
  "Guest Experience",
  "Honeymoon"
];