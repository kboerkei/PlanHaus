import { sqliteTable, text, integer, real, blob } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  avatar: text("avatar"),
  role: text("role").notNull().default("user"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  hasCompletedIntake: integer("has_completed_intake", { mode: "boolean" }).default(false).notNull(),
  isEmailVerified: integer("is_email_verified", { mode: "boolean" }).default(false).notNull(),
  lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const weddingProjects = sqliteTable("wedding_projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  date: integer("date", { mode: "timestamp" }).notNull(),
  venue: text("venue"),
  theme: text("theme"),
  budget: real("budget"),
  guestCount: integer("guest_count"),
  style: text("style"),
  description: text("description"),
  createdBy: integer("created_by").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  priority: text("priority"),
  status: text("status").notNull().default('pending'),
  dueDate: integer("due_date", { mode: "timestamp" }),
  customDate: integer("custom_date", { mode: "timestamp" }),
  defaultTimeframe: text("default_timeframe"),
  timeframeOrder: integer("timeframe_order"),
  assignedTo: text("assigned_to"),
  notes: text("notes"),
  isCompleted: integer("is_completed", { mode: "boolean" }).default(false).notNull(),
  isFromTemplate: integer("is_from_template", { mode: "boolean" }).default(false).notNull(),
  defaultTaskId: integer("default_task_id"),
  createdBy: integer("created_by").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const guests = sqliteTable("guests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  group: text("group"),
  role: text("role"),
  rsvpStatus: text("rsvp_status").default("pending"),
  dietaryRestrictions: text("dietary_restrictions"),
  plusOne: integer("plus_one", { mode: "boolean" }).default(false),
  notes: text("notes"),
  hotelInfo: text("hotel_info"),
  addedBy: integer("added_by").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const vendors = sqliteTable("vendors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  email: text("email"),
  phone: text("phone"),
  website: text("website"),
  address: text("address"),
  status: text("status").default("researching"),
  quote: text("quote"),
  notes: text("notes"),
  addedBy: integer("added_by").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const budgetItems = sqliteTable("budget_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull(),
  category: text("category").notNull(),
  item: text("item").notNull(),
  estimatedCost: text("estimated_cost"),
  actualCost: text("actual_cost"),
  isPaid: integer("is_paid", { mode: "boolean" }).default(false),
  notes: text("notes"),
  createdBy: integer("created_by").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type WeddingProject = typeof weddingProjects.$inferSelect;
export type InsertWeddingProject = typeof weddingProjects.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;
export type Guest = typeof guests.$inferSelect;
export type InsertGuest = typeof guests.$inferInsert;
export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = typeof vendors.$inferInsert;
export type BudgetItem = typeof budgetItems.$inferSelect;
export type InsertBudgetItem = typeof budgetItems.$inferInsert;

// Zod schemas
export const insertUserSchema = createInsertSchema(users);
export const insertWeddingProjectSchema = createInsertSchema(weddingProjects);
export const insertTaskSchema = createInsertSchema(tasks);
export const insertGuestSchema = createInsertSchema(guests);
export const insertVendorSchema = createInsertSchema(vendors);
export const insertBudgetItemSchema = createInsertSchema(budgetItems); 