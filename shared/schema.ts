import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
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

export const shoppingLists = pgTable("shopping_lists", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'decor', 'day-of', 'attire', 'beauty', 'favors', 'other'
  description: text("description"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const shoppingItems = pgTable("shopping_items", {
  id: serial("id").primaryKey(),
  listId: integer("list_id").references(() => shoppingLists.id),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  quantity: integer("quantity").default(1),
  estimatedPrice: decimal("estimated_price", { precision: 10, scale: 2 }),
  actualPrice: decimal("actual_price", { precision: 10, scale: 2 }),
  store: text("store"),
  url: text("url"),
  priority: text("priority").notNull().default("medium"), // 'high', 'medium', 'low'
  status: text("status").notNull().default("needed"), // 'needed', 'ordered', 'purchased', 'returned'
  notes: text("notes"),
  dueDate: timestamp("due_date"),
  purchasedDate: timestamp("purchased_date"),
  assignedTo: integer("assigned_to").references(() => users.id),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const scheduleEvents = pgTable("schedule_events", {
  id: serial("id").primaryKey(),
  scheduleId: integer("schedule_id").references(() => schedules.id),
  projectId: integer("project_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  location: text("location"),
  type: text("type").notNull(), // 'ceremony', 'reception', 'photos', 'transportation', 'vendor', 'personal'
  attendees: text("attendees").array(), // guest IDs or roles
  notes: text("notes"),
  vendorId: integer("vendor_id"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

export const insertShoppingListSchema = createInsertSchema(shoppingLists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertShoppingItemSchema = createInsertSchema(shoppingItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScheduleSchema = createInsertSchema(schedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScheduleEventSchema = createInsertSchema(scheduleEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
// Relations
export const usersRelations = relations(users, ({ many }) => ({
  weddingProjects: many(weddingProjects),
  collaborators: many(collaborators),
  tasks: many(tasks),
  activities: many(activities),
}));

export const weddingProjectsRelations = relations(weddingProjects, ({ one, many }) => ({
  creator: one(users, {
    fields: [weddingProjects.createdBy],
    references: [users.id],
  }),
  collaborators: many(collaborators),
  tasks: many(tasks),
  guests: many(guests),
  vendors: many(vendors),
  budgetItems: many(budgetItems),
  timelineEvents: many(timelineEvents),
  inspirationItems: many(inspirationItems),
  activities: many(activities),
}));

export const collaboratorsRelations = relations(collaborators, ({ one }) => ({
  project: one(weddingProjects, {
    fields: [collaborators.projectId],
    references: [weddingProjects.id],
  }),
  user: one(users, {
    fields: [collaborators.userId],
    references: [users.id],
  }),
  inviter: one(users, {
    fields: [collaborators.invitedBy],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(weddingProjects, {
    fields: [tasks.projectId],
    references: [weddingProjects.id],
  }),
  creator: one(users, {
    fields: [tasks.createdBy],
    references: [users.id],
  }),
  assignee: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
  }),
}));

export const guestsRelations = relations(guests, ({ one }) => ({
  project: one(weddingProjects, {
    fields: [guests.projectId],
    references: [weddingProjects.id],
  }),
  addedByUser: one(users, {
    fields: [guests.addedBy],
    references: [users.id],
  }),
}));

export const vendorsRelations = relations(vendors, ({ one }) => ({
  project: one(weddingProjects, {
    fields: [vendors.projectId],
    references: [weddingProjects.id],
  }),
  addedByUser: one(users, {
    fields: [vendors.addedBy],
    references: [users.id],
  }),
}));

export const budgetItemsRelations = relations(budgetItems, ({ one }) => ({
  project: one(weddingProjects, {
    fields: [budgetItems.projectId],
    references: [weddingProjects.id],
  }),
  creator: one(users, {
    fields: [budgetItems.createdBy],
    references: [users.id],
  }),
}));

export const timelineEventsRelations = relations(timelineEvents, ({ one }) => ({
  project: one(weddingProjects, {
    fields: [timelineEvents.projectId],
    references: [weddingProjects.id],
  }),
  creator: one(users, {
    fields: [timelineEvents.createdBy],
    references: [users.id],
  }),
}));

export const inspirationItemsRelations = relations(inspirationItems, ({ one }) => ({
  project: one(weddingProjects, {
    fields: [inspirationItems.projectId],
    references: [weddingProjects.id],
  }),
  addedByUser: one(users, {
    fields: [inspirationItems.addedBy],
    references: [users.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  project: one(weddingProjects, {
    fields: [activities.projectId],
    references: [weddingProjects.id],
  }),
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

export const shoppingListsRelations = relations(shoppingLists, ({ one, many }) => ({
  project: one(weddingProjects, {
    fields: [shoppingLists.projectId],
    references: [weddingProjects.id],
  }),
  createdBy: one(users, {
    fields: [shoppingLists.createdBy],
    references: [users.id],
  }),
  items: many(shoppingItems),
}));

export const shoppingItemsRelations = relations(shoppingItems, ({ one }) => ({
  list: one(shoppingLists, {
    fields: [shoppingItems.listId],
    references: [shoppingLists.id],
  }),
  project: one(weddingProjects, {
    fields: [shoppingItems.projectId],
    references: [weddingProjects.id],
  }),
  assignedTo: one(users, {
    fields: [shoppingItems.assignedTo],
    references: [users.id],
  }),
  createdBy: one(users, {
    fields: [shoppingItems.createdBy],
    references: [users.id],
  }),
}));

export const schedulesRelations = relations(schedules, ({ one, many }) => ({
  project: one(weddingProjects, {
    fields: [schedules.projectId],
    references: [weddingProjects.id],
  }),
  createdBy: one(users, {
    fields: [schedules.createdBy],
    references: [users.id],
  }),
  events: many(scheduleEvents),
}));

export const scheduleEventsRelations = relations(scheduleEvents, ({ one }) => ({
  schedule: one(schedules, {
    fields: [scheduleEvents.scheduleId],
    references: [schedules.id],
  }),
  project: one(weddingProjects, {
    fields: [scheduleEvents.projectId],
    references: [weddingProjects.id],
  }),
  vendor: one(vendors, {
    fields: [scheduleEvents.vendorId],
    references: [vendors.id],
  }),
  createdBy: one(users, {
    fields: [scheduleEvents.createdBy],
    references: [users.id],
  }),
}));

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
export type ShoppingList = typeof shoppingLists.$inferSelect;
export type InsertShoppingList = z.infer<typeof insertShoppingListSchema>;
export type ShoppingItem = typeof shoppingItems.$inferSelect;
export type InsertShoppingItem = z.infer<typeof insertShoppingItemSchema>;
export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type ScheduleEvent = typeof scheduleEvents.$inferSelect;
export type InsertScheduleEvent = z.infer<typeof insertScheduleEventSchema>;
