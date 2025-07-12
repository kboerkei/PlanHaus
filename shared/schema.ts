import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  role: text("role").notNull(), // 'admin', 'edit', 'view'
  invitedBy: integer("invited_by").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
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
  assignedTo: integer("assigned_to"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const guests = pgTable("guests", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  rsvpStatus: text("rsvp_status").default('pending'), // 'pending', 'accepted', 'declined'
  mealPreference: text("meal_preference"),
  plusOne: boolean("plus_one").default(false),
  group: text("group"), // 'family', 'friends', 'work', etc.
  notes: text("notes"),
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
  quote: decimal("quote", { precision: 10, scale: 2 }),
  status: text("status").default('pending'), // 'pending', 'contacted', 'booked', 'declined'
  notes: text("notes"),
  documents: text("documents").array(),
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
  imageUrl: text("image_url").notNull(),
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
  target: text("target"),
  targetId: integer("target_id"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertWeddingProjectSchema = createInsertSchema(weddingProjects).omit({
  id: true,
  createdAt: true,
});

export const insertCollaboratorSchema = createInsertSchema(collaborators).omit({
  id: true,
  joinedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertGuestSchema = createInsertSchema(guests).omit({
  id: true,
  addedAt: true,
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  addedAt: true,
});

export const insertBudgetItemSchema = createInsertSchema(budgetItems).omit({
  id: true,
  createdAt: true,
});

export const insertTimelineEventSchema = createInsertSchema(timelineEvents).omit({
  id: true,
  createdAt: true,
});

export const insertInspirationItemSchema = createInsertSchema(inspirationItems).omit({
  id: true,
  addedAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type WeddingProject = typeof weddingProjects.$inferSelect;
export type InsertWeddingProject = z.infer<typeof insertWeddingProjectSchema>;
export type Collaborator = typeof collaborators.$inferSelect;
export type InsertCollaborator = z.infer<typeof insertCollaboratorSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Guest = typeof guests.$inferSelect;
export type InsertGuest = z.infer<typeof insertGuestSchema>;
export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type BudgetItem = typeof budgetItems.$inferSelect;
export type InsertBudgetItem = z.infer<typeof insertBudgetItemSchema>;
export type TimelineEvent = typeof timelineEvents.$inferSelect;
export type InsertTimelineEvent = z.infer<typeof insertTimelineEventSchema>;
export type InspirationItem = typeof inspirationItems.$inferSelect;
export type InsertInspirationItem = z.infer<typeof insertInspirationItemSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
