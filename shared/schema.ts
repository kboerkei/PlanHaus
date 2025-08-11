import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  avatar: text("avatar"),
  role: text("role").notNull().default("user"), // 'user', 'planner', 'admin'
  firstName: text("first_name"),
  lastName: text("last_name"),
  hasCompletedIntake: boolean("has_completed_intake").default(false).notNull(),
  isEmailVerified: boolean("is_email_verified").default(false).notNull(),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const weddingProjects = pgTable("wedding_projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  date: timestamp("date").notNull(),
  venue: text("venue"),
  theme: text("theme"),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  guestCount: integer("guest_count"),
  style: text("style"),
  description: text("description"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const collaborators = pgTable("collaborators", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  userId: integer("user_id").notNull(),
  role: text("role", { enum: ['Owner', 'Planner', 'Collaborator', 'Viewer'] }).notNull(),
  invitedBy: integer("invited_by").notNull(),
  status: text("status").notNull().default("active"), // 'pending', 'active', 'inactive'
  permissions: jsonb("permissions"), // Custom permissions object
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull(), // 'admin', 'editor', 'viewer'
  token: text("token").notNull().unique(),
  invitedBy: integer("invited_by").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'accepted', 'expired', 'cancelled'
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const defaultTasks = pgTable("default_tasks", {
  id: serial("id").primaryKey(),
  taskName: text("task_name").notNull(),
  category: text("category").notNull(),
  timeframe: text("timeframe").notNull(), // e.g., "12+ months before", "9-12 months before"
  timeframeOrder: integer("timeframe_order").notNull(), // For sorting: 1=12+months, 2=9-12months, etc.
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  priority: text("priority"), // 'high', 'medium', 'low'
  status: text("status").notNull().default('pending'), // 'pending', 'in_progress', 'completed'
  dueDate: timestamp("due_date"),
  customDate: timestamp("custom_date"), // User-editable date override
  defaultTimeframe: text("default_timeframe"), // Original timeframe from template
  timeframeOrder: integer("timeframe_order"), // For chronological sorting
  assignedTo: text("assigned_to"), // Name of person assigned to task
  notes: text("notes"), // User-editable notes
  isCompleted: boolean("is_completed").default(false).notNull(),
  isFromTemplate: boolean("is_from_template").default(false).notNull(), // Track if from default checklist
  defaultTaskId: integer("default_task_id"), // Reference to original template task
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const guests = pgTable("guests", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  rsvpStatus: text("rsvp_status").default('pending'), // 'pending', 'yes', 'no', 'maybe'
  mealPreference: text("meal_preference"),
  plusOne: boolean("plus_one").default(false),
  partySize: integer("party_size").default(1).notNull(), // Number of people this guest entry represents
  group: text("group"), // 'family', 'friends', 'work', etc.
  notes: text("notes"),
  hotel: text("hotel"),
  hotelAddress: text("hotel_address"),
  checkInDate: timestamp("check_in_date"),
  checkOutDate: timestamp("check_out_date"),
  addedBy: integer("added_by").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'photographer', 'florist', 'caterer', etc.
  email: text("email"),
  phone: text("phone"),
  website: text("website"),
  address: text("address"),
  priceRange: text("price_range"),
  rating: integer("rating"), // 1-5 star rating
  notes: text("notes"),
  status: text("status").default('researching'), // 'researching', 'contacted', 'quoted', 'booked'
  contractSigned: boolean("contract_signed").default(false),
  finalCost: decimal("final_cost", { precision: 10, scale: 2 }),
  depositPaid: boolean("deposit_paid").default(false),
  addedBy: integer("added_by").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const budgetItems = pgTable("budget_items", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  category: text("category").notNull(),
  item: text("item").notNull(),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
  vendorId: integer("vendor_id"),
  isPaid: boolean("is_paid").default(false),
  notes: text("notes"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const timelineEvents = pgTable("timeline_events", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  time: text("time"),
  type: text("type").notNull(), // 'ceremony', 'reception', 'vendor', 'milestone'
  location: text("location"),
  vendorId: integer("vendor_id"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inspirationItems = pgTable("inspiration_items", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  title: text("title"),
  imageUrl: text("image_url"), // Made optional to allow text-only inspiration items
  category: text("category"), // 'venue', 'dress', 'flowers', 'cake', etc.
  notes: text("notes"),
  colors: text("colors").array(),
  tags: text("tags").array(),
  addedBy: integer("added_by").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type"), // 'task', 'guest', 'vendor', 'budget', etc.
  entityId: integer("entity_id"),
  entityName: text("entity_name"), // For display purposes
  details: jsonb("details"), // Additional context about the action
  isVisible: boolean("is_visible").default(true).notNull(), // For filtering sensitive actions
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  date: timestamp("date").notNull(),
  type: text("type").notNull(), // 'wedding_day', 'rehearsal', 'welcome_party', 'brunch', 'custom'
  description: text("description"),
  location: text("location"),
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scheduleEvents = pgTable("schedule_events", {
  id: serial("id").primaryKey(),
  scheduleId: integer("schedule_id").notNull(),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  startTime: text("start_time").notNull(), // Format: "HH:MM"
  endTime: text("end_time"),
  duration: integer("duration"), // Duration in minutes
  location: text("location"),
  description: text("description"),
  vendorId: integer("vendor_id"),
  attendees: text("attendees").array(),
  notes: text("notes"),
  order: integer("order").default(0), // For custom ordering
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Intake form data storage
export const intakeData = pgTable("intake_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  // Couple Info
  partner1FirstName: text("partner1_first_name"),
  partner1LastName: text("partner1_last_name"),
  partner1Email: text("partner1_email"),
  partner2FirstName: text("partner2_first_name"),
  partner2LastName: text("partner2_last_name"),
  partner2Email: text("partner2_email"),
  hasWeddingPlanner: boolean("has_wedding_planner").default(false),
  // Wedding Basics
  weddingDate: text("wedding_date"),
  ceremonyLocation: text("ceremony_location"),
  receptionLocation: text("reception_location"),
  estimatedGuests: integer("estimated_guests"),
  totalBudget: text("total_budget"),
  // Style & Vision
  overallVibe: text("overall_vibe"),
  colorPalette: text("color_palette"),
  mustHaveElements: text("must_have_elements").array(),
  pinterestBoards: text("pinterest_boards").array(),
  // Priorities
  topPriorities: text("top_priorities").array(),
  nonNegotiables: text("non_negotiables"),
  // Key People
  vips: jsonb("vips"), // Array of {name, role} objects
  weddingParty: jsonb("wedding_party"), // Array of {name, role} objects
  officiantStatus: text("officiant_status"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Creative Details Storage
export const creativeDetails = pgTable("creative_details", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  category: text("category").notNull(), // signage, drinks, photos, etc.
  title: text("title").notNull(),
  description: text("description"),
  notes: text("notes"),
  imageUrl: text("image_url"),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  assignedTo: integer("assigned_to"),
  dueDate: timestamp("due_date"),
  isCompleted: boolean("is_completed").default(false),
  completedDate: timestamp("completed_date"),
  priority: text("priority"),
  tags: text("tags").array(),
  additionalData: jsonb("additional_data"), // Flexible JSON storage for category-specific fields
  status: text("status").default('planning'), // 'planning', 'in_progress', 'completed'
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Seating Chart
export const seatingTables = pgTable("seating_tables", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(), // e.g., "Table 1", "Head Table"
  maxSeats: integer("max_seats").notNull(),
  capacity: integer("capacity"),
  notes: text("notes"),
  position: jsonb("position"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const seatingAssignments = pgTable("seating_assignments", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  tableId: integer("table_id").notNull(),
  guestId: integer("guest_id").notNull(),
  seatNumber: integer("seat_number"), // Optional specific seat number
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type WeddingProject = typeof weddingProjects.$inferSelect;
export type InsertWeddingProject = typeof weddingProjects.$inferInsert;

export type Collaborator = typeof collaborators.$inferSelect;
export type InsertCollaborator = typeof collaborators.$inferInsert;

export type Invitation = typeof invitations.$inferSelect;
export type InsertInvitation = typeof invitations.$inferInsert;

export type DefaultTask = typeof defaultTasks.$inferSelect;
export type InsertDefaultTask = typeof defaultTasks.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

export type Guest = typeof guests.$inferSelect;
export type InsertGuest = typeof guests.$inferInsert;

export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = typeof vendors.$inferInsert;

export type BudgetItem = typeof budgetItems.$inferSelect;
export type InsertBudgetItem = typeof budgetItems.$inferInsert;

export type TimelineEvent = typeof timelineEvents.$inferSelect;
export type InsertTimelineEvent = typeof timelineEvents.$inferInsert;

export type InspirationItem = typeof inspirationItems.$inferSelect;
export type InsertInspirationItem = typeof inspirationItems.$inferInsert;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = typeof schedules.$inferInsert;

export type ScheduleEvent = typeof scheduleEvents.$inferSelect;
export type InsertScheduleEvent = typeof scheduleEvents.$inferInsert;

export type IntakeData = typeof intakeData.$inferSelect;
export type InsertIntakeData = typeof intakeData.$inferInsert;

export type CreativeDetail = typeof creativeDetails.$inferSelect;
export type InsertCreativeDetail = typeof creativeDetails.$inferInsert;

export type SeatingTable = typeof seatingTables.$inferSelect;
export type InsertSeatingTable = typeof seatingTables.$inferInsert;

export type SeatingAssignment = typeof seatingAssignments.$inferSelect;
export type InsertSeatingAssignment = typeof seatingAssignments.$inferInsert;

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const insertWeddingProjectSchema = createInsertSchema(weddingProjects);
export const insertCollaboratorSchema = createInsertSchema(collaborators);
export const insertInvitationSchema = createInsertSchema(invitations);
export const insertDefaultTaskSchema = createInsertSchema(defaultTasks);
export const insertTaskSchema = createInsertSchema(tasks);
export const insertGuestSchema = createInsertSchema(guests);
export const insertVendorSchema = createInsertSchema(vendors);
export const insertBudgetItemSchema = createInsertSchema(budgetItems);
export const insertTimelineEventSchema = createInsertSchema(timelineEvents);
export const insertInspirationItemSchema = createInsertSchema(inspirationItems);
export const insertActivitySchema = createInsertSchema(activities);
export const insertScheduleSchema = createInsertSchema(schedules);
export const insertScheduleEventSchema = createInsertSchema(scheduleEvents);
export const insertIntakeDataSchema = createInsertSchema(intakeData);
export const insertCreativeDetailSchema = createInsertSchema(creativeDetails);
export const insertSeatingTableSchema = createInsertSchema(seatingTables).omit({ id: true, projectId: true, createdBy: true, createdAt: true, updatedAt: true });
export const insertSeatingAssignmentSchema = createInsertSchema(seatingAssignments).omit({ id: true, projectId: true, createdAt: true });