import { z } from "zod";

// Common validation patterns
export const phoneRegex = /^[\+]?[(]?[\d\s\-\(\)]{10,}$/;
export const e164PhoneRegex = /^\+[1-9]\d{1,14}$/;

// Reusable field schemas
export const emailField = z.string().email("Please enter a valid email address");
export const phoneField = z.string().regex(phoneRegex, "Please enter a valid phone number");
export const e164PhoneField = z.string().regex(e164PhoneRegex, "Please enter a valid international phone number");
export const requiredText = (fieldName: string) => z.string().min(1, `${fieldName} is required`);
export const optionalText = z.string().optional();
export const positiveNumber = z.number().positive("Must be a positive number");
export const nonNegativeNumber = z.number().min(0, "Must be 0 or greater");
export const urlField = z.string().url("Please enter a valid URL").or(z.literal(""));

// Step 1: Couple & Contacts
export const coupleSchema = z.object({
  couple: z.object({
    firstName: z.array(z.string().min(1, "First name is required")).length(2, "Both partners' first names are required"),
    lastName: z.array(z.string().min(1, "Last name is required")).length(2, "Both partners' last names are required"),
  }),
  emails: z.array(emailField).min(1, "At least one email is required"),
  phones: z.array(e164PhoneField).min(1, "At least one phone number is required"),
  pronouns: z.enum(["he/him", "she/her", "they/them", "he/they", "she/they", "other"]),
  preferredLanguage: z.enum(["en", "de"]).default("en"),
  communicationPreferences: z.enum(["email", "sms", "both"]).default("email"),
  decisionMakers: z.array(z.enum(["Partner A", "Partner B", "Planner", "Parent"])).min(1, "At least one decision maker is required"),
});

// Step 2: Wedding Basics
export const weddingBasicsSchema = z.object({
  workingTitle: requiredText("Working title"),
  date: z.string().min(1, "Wedding date is required"),
  isDateFlexible: z.boolean().default(false),
  flexibilityWindow: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }).optional(),
  location: z.object({
    city: requiredText("City"),
    state: requiredText("State/Region"),
    country: requiredText("Country"),
  }),
  venues: z.object({
    ceremonyVenueName: requiredText("Ceremony venue name"),
    receptionVenueName: z.string().optional(),
    bothSameVenue: z.boolean().default(false),
  }),
  settings: z.object({
    indoorOutdoor: z.array(z.enum(["indoor", "outdoor", "covered"])).min(1, "At least one setting type is required"),
    accessibilityNeeds: optionalText,
  }),
  guests: z.object({
    estimatedGuestCount: z.number().min(1, "Guest count must be at least 1").max(5000, "Guest count cannot exceed 5000"),
    adultsOnly: z.boolean().default(false),
    minorsCount: z.number().min(0).optional(),
  }),
  vips: z.array(z.object({
    name: z.string().min(1, "VIP name is required"),
    role: z.string().min(1, "VIP role is required"),
  })).default([]),
  style: z.object({
    styleVibes: z.array(z.enum([
      "modern", "rustic", "moody", "classic", "whimsical", "garden", 
      "industrial", "beach", "mountain", "destination", "boho"
    ])).min(1, "At least one style vibe is required"),
    colorPalette: z.array(z.object({
      name: z.string().min(1, "Color name is required"),
      hex: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
    })).default([]),
    priorities: z.array(z.enum([
      "music", "food", "photos", "decor", "convenience", "budget", 
      "late-night", "sustainability"
    ])).min(1, "At least one priority is required").max(5, "Maximum 5 priorities allowed"),
  }),
});

// Step 3: Budget
export const budgetSchema = z.object({
  totalBudget: positiveNumber,
  currency: z.enum(["USD", "EUR", "GBP", "CAD", "AUD"]).default("USD"),
  presetSplit: z.enum([
    "classic", "diy-heavy", "luxury", "minimalist", "custom"
  ]).default("classic"),
  categories: z.array(z.object({
    name: z.enum([
      "venue", "catering", "bar", "photography", "video", "florals", 
      "planning", "music", "attire", "stationery", "rentals", 
      "cake", "transportation", "beauty", "misc"
    ]),
    percent: z.number().min(0).max(100),
    hardCap: z.number().min(0).optional(),
  })),
  mustHaves: z.array(z.string()).default([]),
  niceToHaves: z.array(z.string()).default([]),
}).refine((data) => {
  const totalPercent = data.categories.reduce((sum, cat) => sum + cat.percent, 0);
  return Math.abs(totalPercent - 100) < 1; // Allow 1% rounding difference
}, {
  message: "Category percentages must sum to 100%",
  path: ["categories"],
});

// Step 4: Ceremony & Reception Details
export const ceremonyReceptionSchema = z.object({
  ceremony: z.object({
    type: z.enum(["civil", "religious-light", "religious-traditional", "symbolic"]),
    officiantNeeded: z.boolean().default(false),
    officiantNotes: optionalText,
  }),
  timeline: z.object({
    preferences: optionalText,
    sunsetCeremony: z.boolean().default(false),
  }),
  dining: z.object({
    mealStyle: z.enum(["plated", "buffet", "family-style", "stations", "cocktail-style"]),
    barPreference: z.enum(["open", "limited", "cash", "dry"]),
  }),
  seating: z.object({
    style: z.enum(["long-tables", "u-shape", "rounds", "mixed"]),
    danceFloorRequired: z.boolean().default(true),
    stageRequired: z.boolean().default(false),
  }),
  specialMoments: z.array(z.enum([
    "first-look", "private-vows", "sparkler-exit", "cigar-bar", "afterparty"
  ])).default([]),
  timing: z.object({
    noiseOrdinanceTime: z.string().optional(),
    venueCutoffTime: z.string().optional(),
  }),
});

// Step 5: Vendor Preferences
export const vendorPreferencesSchema = z.object({
  requiredVendors: z.array(z.enum([
    "photographer", "videographer", "florist", "caterer", "musician", 
    "officiant", "transportation", "beauty", "attire", "stationery"
  ])).min(1, "At least one vendor is required"),
  photographer: z.object({
    style: z.enum(["editorial", "documentary", "fine-art", "flash", "film"]).optional(),
  }),
  music: z.object({
    bandOrDJ: z.enum(["band", "dj", "both", "unsure"]).optional(),
    genres: z.array(z.string()).default([]),
  }),
  florals: z.object({
    style: z.enum(["minimal", "lush", "moody", "seasonal-wild"]).optional(),
  }),
  catering: z.object({
    notes: optionalText,
    dietaryRestrictions: z.array(z.string()).default([]),
    cuisinePreferences: z.array(z.string()).default([]),
  }),
  rentals: z.array(z.enum([
    "tables", "chairs", "linens", "lounge-furniture", "lighting", 
    "tenting", "restrooms"
  ])).default([]),
  budgetBands: z.record(z.string(), z.enum(["low", "medium", "high"])).default({}),
  search: z.object({
    radiusMiles: z.number().min(1).max(100).default(50),
    preferredZip: z.string().optional(),
    availabilityWindow: z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }).optional(),
  }),
  inspiration: z.array(urlField).default([]),
});

// Step 6: Guests, Travel & Logistics
export const logisticsSchema = z.object({
  travel: z.object({
    majorityFromOutOfTown: z.boolean().default(false),
    hotelBlocksNeeded: z.number().min(0).optional(),
    shuttleNeeded: z.boolean().default(false),
    ceremonyToReceptionTravelTime: z.number().min(0).optional(),
    accessibilityNotes: optionalText,
  }),
  guests: z.object({
    kidsPolicy: z.enum(["all", "family-only", "none"]).default("all"),
    rsvpPreference: z.enum(["site", "email", "qr-code"]).default("site"),
  }),
  website: z.object({
    needed: z.boolean().default(false),
    copyTone: z.enum(["friendly", "formal", "playful"]).default("friendly"),
    bilingualSite: z.boolean().default(false),
  }),
});

// Step 7: Review & Submit
export const reviewSubmitSchema = z.object({
  consent: z.boolean().refine((val) => val === true, {
    message: "You must consent to data use",
  }),
  emailCopy: z.boolean().default(false),
});

// Complete Intake Schema
export const intakeSchema = z.object({
  step1: coupleSchema,
  step2: weddingBasicsSchema,
  step3: budgetSchema,
  step4: ceremonyReceptionSchema,
  step5: vendorPreferencesSchema,
  step6: logisticsSchema,
  step7: reviewSubmitSchema,
});

// Draft schema (all fields optional)
export const intakeDraftSchema = intakeSchema.deepPartial();

// Type exports
export type CoupleData = z.infer<typeof coupleSchema>;
export type WeddingBasicsData = z.infer<typeof weddingBasicsSchema>;
export type BudgetData = z.infer<typeof budgetSchema>;
export type CeremonyReceptionData = z.infer<typeof ceremonyReceptionSchema>;
export type VendorPreferencesData = z.infer<typeof vendorPreferencesSchema>;
export type LogisticsData = z.infer<typeof logisticsSchema>;
export type ReviewSubmitData = z.infer<typeof reviewSubmitSchema>;
export type IntakeData = z.infer<typeof intakeSchema>;
export type IntakeDraftData = z.infer<typeof intakeDraftSchema>;

// Validation helpers
export const validateStep = (step: keyof IntakeData, data: any) => {
  const stepSchemas = {
    step1: coupleSchema,
    step2: weddingBasicsSchema,
    step3: budgetSchema,
    step4: ceremonyReceptionSchema,
    step5: vendorPreferencesSchema,
    step6: logisticsSchema,
    step7: reviewSubmitSchema,
  };
  
  return stepSchemas[step].safeParse(data);
};

// Budget calculation helpers
export const calculateBudgetRemaining = (categories: BudgetData['categories']) => {
  const totalPercent = categories.reduce((sum, cat) => sum + cat.percent, 0);
  return 100 - totalPercent;
};

export const getPresetBudgetSplits = () => ({
  classic: [
    { name: "venue", percent: 45 },
    { name: "catering", percent: 30 },
    { name: "photography", percent: 10 },
    { name: "florals", percent: 8 },
    { name: "music", percent: 7 },
  ],
  "diy-heavy": [
    { name: "venue", percent: 50 },
    { name: "catering", percent: 25 },
    { name: "photography", percent: 15 },
    { name: "florals", percent: 5 },
    { name: "music", percent: 5 },
  ],
  luxury: [
    { name: "venue", percent: 35 },
    { name: "catering", percent: 25 },
    { name: "photography", percent: 15 },
    { name: "florals", percent: 12 },
    { name: "music", percent: 8 },
    { name: "attire", percent: 5 },
  ],
  minimalist: [
    { name: "venue", percent: 60 },
    { name: "catering", percent: 25 },
    { name: "photography", percent: 10 },
    { name: "music", percent: 5 },
  ],
}); 