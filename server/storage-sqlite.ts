import { db } from "./db";
import * as schema from "@shared/schema-sqlite";
import { eq, and } from "drizzle-orm";

export class SQLiteStorage {
  // Users
  async createUser(user: schema.InsertUser): Promise<schema.User> {
    const now = new Date();
    const result = await db.insert(schema.users).values({
      ...user,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return result[0];
  }

  async getUserByEmail(email: string): Promise<schema.User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return result[0];
  }

  async getUserById(id: number): Promise<schema.User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return result[0];
  }

  // Wedding Projects
  async createWeddingProject(project: schema.InsertWeddingProject): Promise<schema.WeddingProject> {
    const now = new Date();
    const result = await db.insert(schema.weddingProjects).values({
      ...project,
      createdAt: now,
    }).returning();
    return result[0];
  }

  async getWeddingProjectsByUserId(userId: number): Promise<schema.WeddingProject[]> {
    return await db.select().from(schema.weddingProjects).where(eq(schema.weddingProjects.createdBy, userId));
  }

  async getWeddingProjectById(id: number): Promise<schema.WeddingProject | undefined> {
    const result = await db.select().from(schema.weddingProjects).where(eq(schema.weddingProjects.id, id));
    return result[0];
  }

  // Tasks
  async createTask(task: schema.InsertTask): Promise<schema.Task> {
    const now = new Date();
    const result = await db.insert(schema.tasks).values({
      ...task,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return result[0];
  }

  async getTasksByProjectId(projectId: number): Promise<schema.Task[]> {
    return await db.select().from(schema.tasks).where(eq(schema.tasks.projectId, projectId));
  }

  async updateTask(id: number, updates: Partial<schema.InsertTask>): Promise<schema.Task | undefined> {
    const now = new Date();
    const result = await db.update(schema.tasks)
      .set({ ...updates, updatedAt: now })
      .where(eq(schema.tasks.id, id))
      .returning();
    return result[0];
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(schema.tasks).where(eq(schema.tasks.id, id));
    return result.changes > 0;
  }

  // Guests
  async createGuest(guest: schema.InsertGuest): Promise<schema.Guest> {
    const now = new Date();
    const result = await db.insert(schema.guests).values({
      ...guest,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return result[0];
  }

  async getGuestsByProjectId(projectId: number): Promise<schema.Guest[]> {
    return await db.select().from(schema.guests).where(eq(schema.guests.projectId, projectId));
  }

  async updateGuest(id: number, updates: Partial<schema.InsertGuest>): Promise<schema.Guest | undefined> {
    const now = new Date();
    const result = await db.update(schema.guests)
      .set({ ...updates, updatedAt: now })
      .where(eq(schema.guests.id, id))
      .returning();
    return result[0];
  }

  async deleteGuest(id: number): Promise<boolean> {
    const result = await db.delete(schema.guests).where(eq(schema.guests.id, id));
    return result.changes > 0;
  }

  // Vendors
  async createVendor(vendor: schema.InsertVendor): Promise<schema.Vendor> {
    const now = new Date();
    const result = await db.insert(schema.vendors).values({
      ...vendor,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return result[0];
  }

  async getVendorsByProjectId(projectId: number): Promise<schema.Vendor[]> {
    return await db.select().from(schema.vendors).where(eq(schema.vendors.projectId, projectId));
  }

  async updateVendor(id: number, updates: Partial<schema.InsertVendor>): Promise<schema.Vendor | undefined> {
    const now = new Date();
    const result = await db.update(schema.vendors)
      .set({ ...updates, updatedAt: now })
      .where(eq(schema.vendors.id, id))
      .returning();
    return result[0];
  }

  async deleteVendor(id: number): Promise<boolean> {
    const result = await db.delete(schema.vendors).where(eq(schema.vendors.id, id));
    return result.changes > 0;
  }

  // Budget Items
  async createBudgetItem(item: schema.InsertBudgetItem): Promise<schema.BudgetItem> {
    const now = new Date();
    const result = await db.insert(schema.budgetItems).values({
      ...item,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return result[0];
  }

  async getBudgetItemsByProjectId(projectId: number): Promise<schema.BudgetItem[]> {
    return await db.select().from(schema.budgetItems).where(eq(schema.budgetItems.projectId, projectId));
  }

  async updateBudgetItem(id: number, updates: Partial<schema.InsertBudgetItem>): Promise<schema.BudgetItem | undefined> {
    const now = new Date();
    const result = await db.update(schema.budgetItems)
      .set({ ...updates, updatedAt: now })
      .where(eq(schema.budgetItems.id, id))
      .returning();
    return result[0];
  }

  async deleteBudgetItem(id: number): Promise<boolean> {
    const result = await db.delete(schema.budgetItems).where(eq(schema.budgetItems.id, id));
    return result.changes > 0;
  }
} 