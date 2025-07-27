import {
  users, weddingProjects, collaborators, defaultTasks, tasks, guests, vendors, vendorPayments, budgetItems,
  timelineEvents, inspirationItems, activities, shoppingLists, shoppingItems,
  schedules, scheduleEvents, intakeData, weddingOverview,
  type User, type InsertUser, type WeddingProject, type InsertWeddingProject,
  type Collaborator, type InsertCollaborator, type DefaultTask, type InsertDefaultTask,
  type Task, type InsertTask, type Guest, type InsertGuest, type Vendor, type InsertVendor,
  type VendorPayment, type InsertVendorPayment,
  type BudgetItem, type InsertBudgetItem, type TimelineEvent, type InsertTimelineEvent,
  type InspirationItem, type InsertInspirationItem, type Activity, type InsertActivity,
  type ShoppingList, type InsertShoppingList, type ShoppingItem, type InsertShoppingItem,
  type Schedule, type InsertSchedule, type ScheduleEvent, type InsertScheduleEvent,
  type IntakeData, type InsertIntakeData, type WeddingOverview, type InsertWeddingOverview
} from "@shared/schema";

export interface IStorage {
  // Users
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;

  // Wedding Projects
  createWeddingProject(project: InsertWeddingProject): Promise<WeddingProject>;
  getWeddingProjectById(id: number): Promise<WeddingProject | undefined>;
  getWeddingProjectsByUserId(userId: number): Promise<WeddingProject[]>;
  getWeddingProjectByUserId(userId: number): Promise<WeddingProject | undefined>;
  updateWeddingProject(id: number, updates: Partial<InsertWeddingProject>): Promise<WeddingProject | undefined>;
  deleteWeddingProject(id: number): Promise<boolean>;

  // Collaborators
  addCollaborator(collaborator: InsertCollaborator): Promise<Collaborator>;
  getCollaboratorsByProjectId(projectId: number): Promise<(Collaborator & { user: User })[]>;
  updateCollaboratorRole(id: number, role: string): Promise<Collaborator | undefined>;
  removeCollaborator(id: number): Promise<boolean>;

  // Default Tasks
  createDefaultTask(task: InsertDefaultTask): Promise<DefaultTask>;
  getDefaultTasks(): Promise<DefaultTask[]>;
  seedDefaultTasks(): Promise<void>;

  // Tasks
  createTask(task: InsertTask): Promise<Task>;
  getTaskById(id: number): Promise<Task | undefined>;
  getTasksByProjectId(projectId: number): Promise<Task[]>;
  updateTask(id: number, updates: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  completeTask(id: number): Promise<Task | undefined>;
  createTasksFromTemplate(projectId: number, userId: number, weddingDate: Date): Promise<Task[]>;

  // Guests
  createGuest(guest: InsertGuest): Promise<Guest>;
  getGuestById(id: number): Promise<Guest | undefined>;
  getGuestsByProjectId(projectId: number): Promise<Guest[]>;
  updateGuest(id: number, updates: Partial<InsertGuest>): Promise<Guest | undefined>;
  deleteGuest(id: number): Promise<boolean>;
  updateGuestRsvp(id: number, status: string, mealPreference?: string): Promise<Guest | undefined>;

  // Vendors
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  getVendorsByProjectId(projectId: number): Promise<Vendor[]>;
  updateVendor(id: number, updates: Partial<InsertVendor>): Promise<Vendor | undefined>;
  deleteVendor(id: number): Promise<boolean>;

  // Vendor Payments
  createVendorPayment(payment: InsertVendorPayment): Promise<VendorPayment>;
  getVendorPaymentsByVendorId(vendorId: number): Promise<VendorPayment[]>;
  getVendorPaymentsByProjectId(projectId: number): Promise<VendorPayment[]>;
  updateVendorPayment(id: number, updates: Partial<InsertVendorPayment>): Promise<VendorPayment | undefined>;
  deleteVendorPayment(id: number): Promise<boolean>;
  markVendorPaymentPaid(id: number): Promise<VendorPayment | undefined>;

  // Budget Items
  createBudgetItem(item: InsertBudgetItem): Promise<BudgetItem>;
  getBudgetItemsByProjectId(projectId: number): Promise<BudgetItem[]>;
  updateBudgetItem(id: number, updates: Partial<InsertBudgetItem>): Promise<BudgetItem | undefined>;
  deleteBudgetItem(id: number): Promise<boolean>;

  // Timeline Events
  createTimelineEvent(event: InsertTimelineEvent): Promise<TimelineEvent>;
  getTimelineEventsByProjectId(projectId: number): Promise<TimelineEvent[]>;
  updateTimelineEvent(id: number, updates: Partial<InsertTimelineEvent>): Promise<TimelineEvent | undefined>;
  deleteTimelineEvent(id: number): Promise<boolean>;

  // Inspiration Items
  createInspirationItem(item: InsertInspirationItem): Promise<InspirationItem>;
  getInspirationItemsByProjectId(projectId: number): Promise<InspirationItem[]>;
  updateInspirationItem(id: number, updates: Partial<InsertInspirationItem>): Promise<InspirationItem | undefined>;
  deleteInspirationItem(id: number): Promise<boolean>;

  // Activities
  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivitiesByProjectId(projectId: number): Promise<(Activity & { user: User })[]>;

  // Shopping Lists
  createShoppingList(list: InsertShoppingList): Promise<ShoppingList>;
  getShoppingListsByProjectId(projectId: number): Promise<ShoppingList[]>;
  updateShoppingList(id: number, updates: Partial<InsertShoppingList>): Promise<ShoppingList | undefined>;
  deleteShoppingList(id: number): Promise<boolean>;

  // Shopping Items
  createShoppingItem(item: InsertShoppingItem): Promise<ShoppingItem>;
  getShoppingItemsByProjectId(projectId: number): Promise<ShoppingItem[]>;
  getShoppingItemsByListId(listId: number): Promise<ShoppingItem[]>;
  updateShoppingItem(id: number, updates: Partial<InsertShoppingItem>): Promise<ShoppingItem | undefined>;
  deleteShoppingItem(id: number): Promise<boolean>;
  markItemPurchased(id: number): Promise<ShoppingItem | undefined>;

  // Schedules
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  getSchedulesByProjectId(projectId: number): Promise<Schedule[]>;
  getScheduleById(id: number): Promise<Schedule | undefined>;
  updateSchedule(id: number, updates: Partial<InsertSchedule>): Promise<Schedule | undefined>;
  deleteSchedule(id: number): Promise<boolean>;

  // Schedule Events
  createScheduleEvent(event: InsertScheduleEvent): Promise<ScheduleEvent>;
  getScheduleEventsByScheduleId(scheduleId: number): Promise<ScheduleEvent[]>;
  updateScheduleEvent(id: number, updates: Partial<InsertScheduleEvent>): Promise<ScheduleEvent | undefined>;
  deleteScheduleEvent(id: number): Promise<boolean>;

  // Intake Data
  createIntakeData(data: InsertIntakeData): Promise<IntakeData>;
  getIntakeDataByUserId(userId: number): Promise<IntakeData | undefined>;
  updateIntakeData(userId: number, updates: Partial<InsertIntakeData>): Promise<IntakeData | undefined>;
  markUserIntakeComplete(userId: number): Promise<boolean>;

  // Wedding Overview
  createWeddingOverview(overview: InsertWeddingOverview): Promise<WeddingOverview>;
  getWeddingOverviewByProjectId(projectId: number): Promise<WeddingOverview | undefined>;
  updateWeddingOverview(projectId: number, updates: Partial<InsertWeddingOverview>): Promise<WeddingOverview | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private weddingProjects: Map<number, WeddingProject> = new Map();
  private collaborators: Map<number, Collaborator> = new Map();
  private tasks: Map<number, Task> = new Map();
  private guests: Map<number, Guest> = new Map();
  private vendors: Map<number, Vendor> = new Map();
  private budgetItems: Map<number, BudgetItem> = new Map();
  private timelineEvents: Map<number, TimelineEvent> = new Map();
  private inspirationItems: Map<number, InspirationItem> = new Map();
  private activities: Map<number, Activity> = new Map();
  private vendorPayments: Map<number, VendorPayment> = new Map();

  private currentId = 1;

  private generateId(): number {
    return this.currentId++;
  }

  // Users
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.generateId();
    const user: User = {
      id,
      username: insertUser.username,
      email: insertUser.email, 
      password: insertUser.password,
      avatar: insertUser.avatar ?? null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  // Wedding Projects
  async createWeddingProject(insertProject: InsertWeddingProject): Promise<WeddingProject> {
    const id = this.generateId();
    const project: WeddingProject = {
      id,
      name: insertProject.name,
      description: insertProject.description ?? null,
      date: insertProject.date,
      budget: insertProject.budget ?? null,
      venue: insertProject.venue ?? null,
      theme: insertProject.theme ?? null,
      guestCount: insertProject.guestCount ?? null,
      style: insertProject.style ?? null,
      createdBy: insertProject.createdBy,
      createdAt: new Date(),
    };
    this.weddingProjects.set(id, project);
    return project;
  }

  async getWeddingProjectById(id: number): Promise<WeddingProject | undefined> {
    return this.weddingProjects.get(id);
  }

  async getWeddingProjectsByUserId(userId: number): Promise<WeddingProject[]> {
    const userProjects = Array.from(this.weddingProjects.values())
      .filter(project => project.createdBy === userId);
    
    const collaboratedProjects = Array.from(this.collaborators.values())
      .filter(collab => collab.userId === userId)
      .map(collab => this.weddingProjects.get(collab.projectId))
      .filter(Boolean) as WeddingProject[];

    return [...userProjects, ...collaboratedProjects];
  }

  async updateWeddingProject(id: number, updates: Partial<InsertWeddingProject>): Promise<WeddingProject | undefined> {
    const project = this.weddingProjects.get(id);
    if (!project) return undefined;

    const updated = { ...project, ...updates };
    this.weddingProjects.set(id, updated);
    return updated;
  }

  // Collaborators
  async addCollaborator(insertCollaborator: InsertCollaborator): Promise<Collaborator> {
    const id = this.generateId();
    const collaborator: Collaborator = {
      ...insertCollaborator,
      id,
      joinedAt: new Date(),
    };
    this.collaborators.set(id, collaborator);
    return collaborator;
  }

  async getCollaboratorsByProjectId(projectId: number): Promise<(Collaborator & { user: User })[]> {
    const collabs = Array.from(this.collaborators.values())
      .filter(collab => collab.projectId === projectId);
    
    return collabs.map(collab => ({
      ...collab,
      user: this.users.get(collab.userId)!,
    }));
  }

  async updateCollaboratorRole(id: number, role: string): Promise<Collaborator | undefined> {
    const collaborator = this.collaborators.get(id);
    if (!collaborator) return undefined;

    const updated = { ...collaborator, role };
    this.collaborators.set(id, updated);
    return updated;
  }

  async removeCollaborator(id: number): Promise<boolean> {
    return this.collaborators.delete(id);
  }

  // Tasks
  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.generateId();
    const task: Task = {
      id,
      title: insertTask.title,
      description: insertTask.description ?? null,
      status: insertTask.status ?? 'pending',
      category: insertTask.category ?? null,
      priority: insertTask.priority ?? null,
      dueDate: insertTask.dueDate ?? null,
      assignedTo: insertTask.assignedTo ?? null,
      completedAt: null,
      createdBy: insertTask.createdBy,
      projectId: insertTask.projectId,
      createdAt: new Date(),
    };
    this.tasks.set(id, task);
    return task;
  }

  async getTaskById(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByProjectId(projectId: number): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.projectId === projectId);
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const updated = { ...task, ...updates };
    this.tasks.set(id, updated);
    return updated;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async completeTask(id: number): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const updated = { 
      ...task, 
      status: 'completed',
      completedAt: new Date(),
    };
    this.tasks.set(id, updated);
    return updated;
  }

  // Guests
  async createGuest(insertGuest: InsertGuest): Promise<Guest> {
    const id = this.generateId();
    const guest: Guest = {
      id,
      name: insertGuest.name,
      email: insertGuest.email ?? null,
      phone: insertGuest.phone ?? null,
      address: insertGuest.address ?? null,
      rsvpStatus: insertGuest.rsvpStatus ?? null,
      mealPreference: insertGuest.mealPreference ?? null,
      plusOne: insertGuest.plusOne ?? null,
      group: insertGuest.group ?? null,
      notes: insertGuest.notes ?? null,
      projectId: insertGuest.projectId,
      addedBy: insertGuest.addedBy,
      addedAt: new Date(),
    };
    this.guests.set(id, guest);
    return guest;
  }

  async getGuestsByProjectId(projectId: number): Promise<Guest[]> {
    return Array.from(this.guests.values())
      .filter(guest => guest.projectId === projectId);
  }

  async updateGuest(id: number, updates: Partial<InsertGuest>): Promise<Guest | undefined> {
    const guest = this.guests.get(id);
    if (!guest) return undefined;

    const updated = { ...guest, ...updates };
    this.guests.set(id, updated);
    return updated;
  }

  async deleteGuest(id: number): Promise<boolean> {
    return this.guests.delete(id);
  }

  async updateGuestRsvp(id: number, status: string, mealPreference?: string): Promise<Guest | undefined> {
    const guest = this.guests.get(id);
    if (!guest) return undefined;

    const updated = { 
      ...guest, 
      rsvpStatus: status,
      ...(mealPreference && { mealPreference }),
    };
    this.guests.set(id, updated);
    return updated;
  }

  // Vendors
  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const id = this.generateId();
    const vendor: Vendor = {
      id,
      name: insertVendor.name,
      category: insertVendor.category,
      email: insertVendor.email ?? null,
      phone: insertVendor.phone ?? null,
      address: insertVendor.address ?? null,
      website: insertVendor.website ?? null,
      status: insertVendor.status ?? null,
      quote: insertVendor.quote ?? null,
      notes: insertVendor.notes ?? null,
      contractUrl: insertVendor.contractUrl ?? null,
      contractSigned: insertVendor.contractSigned ?? null,
      contractSignedDate: insertVendor.contractSignedDate ?? null,
      documents: insertVendor.documents ?? null,
      projectId: insertVendor.projectId,
      addedBy: insertVendor.addedBy,
      addedAt: new Date(),
    };
    this.vendors.set(id, vendor);
    return vendor;
  }

  async getVendorsByProjectId(projectId: number): Promise<Vendor[]> {
    return Array.from(this.vendors.values())
      .filter(vendor => vendor.projectId === projectId);
  }

  async updateVendor(id: number, updates: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const vendor = this.vendors.get(id);
    if (!vendor) return undefined;

    const updated = { ...vendor, ...updates };
    this.vendors.set(id, updated);
    return updated;
  }

  async deleteVendor(id: number): Promise<boolean> {
    return this.vendors.delete(id);
  }

  // Vendor Payments
  async createVendorPayment(insertPayment: InsertVendorPayment): Promise<VendorPayment> {
    const id = this.generateId();
    const payment: VendorPayment = {
      id,
      vendorId: insertPayment.vendorId,
      projectId: insertPayment.projectId,
      paymentType: insertPayment.paymentType,
      amount: insertPayment.amount,
      dueDate: insertPayment.dueDate,
      paidDate: insertPayment.paidDate ?? null,
      isPaid: insertPayment.isPaid ?? false,
      notes: insertPayment.notes ?? null,
      createdBy: insertPayment.createdBy,
      createdAt: new Date(),
    };
    this.vendorPayments.set(id, payment);
    return payment;
  }

  async getVendorPaymentsByVendorId(vendorId: number): Promise<VendorPayment[]> {
    return Array.from(this.vendorPayments.values())
      .filter(payment => payment.vendorId === vendorId);
  }

  async getVendorPaymentsByProjectId(projectId: number): Promise<VendorPayment[]> {
    return Array.from(this.vendorPayments.values())
      .filter(payment => payment.projectId === projectId);
  }

  async updateVendorPayment(id: number, updates: Partial<InsertVendorPayment>): Promise<VendorPayment | undefined> {
    const payment = this.vendorPayments.get(id);
    if (!payment) return undefined;

    const updated = { ...payment, ...updates };
    this.vendorPayments.set(id, updated);
    return updated;
  }

  async deleteVendorPayment(id: number): Promise<boolean> {
    return this.vendorPayments.delete(id);
  }

  async markVendorPaymentPaid(id: number): Promise<VendorPayment | undefined> {
    const payment = this.vendorPayments.get(id);
    if (!payment) return undefined;

    const updated = { 
      ...payment, 
      isPaid: true,
      paidDate: new Date(),
    };
    this.vendorPayments.set(id, updated);
    return updated;
  }

  // Budget Items
  async createBudgetItem(insertItem: InsertBudgetItem): Promise<BudgetItem> {
    const id = this.generateId();
    const item: BudgetItem = {
      id,
      category: insertItem.category,
      item: insertItem.item,
      estimatedCost: insertItem.estimatedCost ?? null,
      actualCost: insertItem.actualCost ?? null,
      vendorId: insertItem.vendorId ?? null,
      isPaid: insertItem.isPaid ?? null,
      notes: insertItem.notes ?? null,
      createdBy: insertItem.createdBy,
      projectId: insertItem.projectId,
      createdAt: new Date(),
    };
    this.budgetItems.set(id, item);
    return item;
  }

  async getBudgetItemsByProjectId(projectId: number): Promise<BudgetItem[]> {
    return Array.from(this.budgetItems.values())
      .filter(item => item.projectId === projectId);
  }

  async updateBudgetItem(id: number, updates: Partial<InsertBudgetItem>): Promise<BudgetItem | undefined> {
    const item = this.budgetItems.get(id);
    if (!item) return undefined;

    const updated = { ...item, ...updates };
    this.budgetItems.set(id, updated);
    return updated;
  }

  async deleteBudgetItem(id: number): Promise<boolean> {
    return this.budgetItems.delete(id);
  }

  // Timeline Events
  async createTimelineEvent(insertEvent: InsertTimelineEvent): Promise<TimelineEvent> {
    const id = this.generateId();
    const event: TimelineEvent = {
      id,
      title: insertEvent.title,
      description: insertEvent.description ?? null,
      type: insertEvent.type,
      date: insertEvent.date,
      time: insertEvent.time ?? null,
      location: insertEvent.location ?? null,
      vendorId: insertEvent.vendorId ?? null,
      createdBy: insertEvent.createdBy,
      projectId: insertEvent.projectId,
      createdAt: new Date(),
    };
    this.timelineEvents.set(id, event);
    return event;
  }

  async getTimelineEventsByProjectId(projectId: number): Promise<TimelineEvent[]> {
    return Array.from(this.timelineEvents.values())
      .filter(event => event.projectId === projectId);
  }

  async updateTimelineEvent(id: number, updates: Partial<InsertTimelineEvent>): Promise<TimelineEvent | undefined> {
    const event = this.timelineEvents.get(id);
    if (!event) return undefined;

    const updated = { ...event, ...updates };
    this.timelineEvents.set(id, updated);
    return updated;
  }

  async deleteTimelineEvent(id: number): Promise<boolean> {
    return this.timelineEvents.delete(id);
  }

  // Inspiration Items
  async createInspirationItem(insertItem: InsertInspirationItem): Promise<InspirationItem> {
    const id = this.generateId();
    const item: InspirationItem = {
      id,
      title: insertItem.title ?? null,
      category: insertItem.category ?? null,
      notes: insertItem.notes ?? null,
      imageUrl: insertItem.imageUrl,
      colors: insertItem.colors ?? null,
      tags: insertItem.tags ?? null,
      projectId: insertItem.projectId,
      addedBy: insertItem.addedBy,
      addedAt: new Date(),
    };
    this.inspirationItems.set(id, item);
    return item;
  }

  async getInspirationItemsByProjectId(projectId: number): Promise<InspirationItem[]> {
    return Array.from(this.inspirationItems.values())
      .filter(item => item.projectId === projectId);
  }

  async getInspirationItemById(id: number): Promise<InspirationItem | undefined> {
    return this.inspirationItems.get(id);
  }

  async updateInspirationItem(id: number, updates: Partial<InsertInspirationItem>): Promise<InspirationItem | undefined> {
    const item = this.inspirationItems.get(id);
    if (!item) return undefined;

    const updated = { ...item, ...updates };
    this.inspirationItems.set(id, updated);
    return updated;
  }

  async deleteInspirationItem(id: number): Promise<boolean> {
    return this.inspirationItems.delete(id);
  }

  // Activities
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.generateId();
    const activity: Activity = {
      id,
      action: insertActivity.action,
      target: insertActivity.target ?? null,
      targetId: insertActivity.targetId ?? null,
      details: insertActivity.details ?? null,
      userId: insertActivity.userId,
      projectId: insertActivity.projectId,
      createdAt: new Date(),
    };
    this.activities.set(id, activity);
    return activity;
  }

  async getActivitiesByProjectId(projectId: number): Promise<(Activity & { user: User })[]> {
    const activities = Array.from(this.activities.values())
      .filter(activity => activity.projectId === projectId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return activities.map(activity => ({
      ...activity,
      user: this.users.get(activity.userId)!,
    }));
  }
}

// Database Storage Implementation
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async createWeddingProject(insertProject: InsertWeddingProject): Promise<WeddingProject> {
    const [project] = await db.insert(weddingProjects).values(insertProject).returning();
    return project;
  }

  async getWeddingProjectById(id: number): Promise<WeddingProject | undefined> {
    const [project] = await db.select().from(weddingProjects).where(eq(weddingProjects.id, id));
    return project || undefined;
  }

  async getWeddingProjectsByUserId(userId: number): Promise<WeddingProject[]> {
    return await db.select().from(weddingProjects).where(eq(weddingProjects.createdBy, userId));
  }

  async getWeddingProjectByUserId(userId: number): Promise<WeddingProject | undefined> {
    const [project] = await db.select().from(weddingProjects).where(eq(weddingProjects.createdBy, userId));
    return project || undefined;
  }

  async updateWeddingProject(id: number, updates: Partial<InsertWeddingProject>): Promise<WeddingProject | undefined> {
    const [project] = await db.update(weddingProjects).set(updates).where(eq(weddingProjects.id, id)).returning();
    return project || undefined;
  }

  async deleteWeddingProject(id: number): Promise<boolean> {
    const result = await db.delete(weddingProjects).where(eq(weddingProjects.id, id));
    return result.rowCount > 0;
  }

  async addCollaborator(insertCollaborator: InsertCollaborator): Promise<Collaborator> {
    const [collaborator] = await db.insert(collaborators).values(insertCollaborator).returning();
    return collaborator;
  }

  async getCollaboratorsByProjectId(projectId: number): Promise<(Collaborator & { user: User })[]> {
    const result = await db
      .select({
        id: collaborators.id,
        projectId: collaborators.projectId,
        userId: collaborators.userId,
        role: collaborators.role,
        invitedBy: collaborators.invitedBy,
        joinedAt: collaborators.joinedAt,
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
          avatar: users.avatar,
          password: users.password,
          createdAt: users.createdAt,
        }
      })
      .from(collaborators)
      .innerJoin(users, eq(collaborators.userId, users.id))
      .where(eq(collaborators.projectId, projectId));

    return result.map(row => ({
      ...row,
      user: row.user
    }));
  }

  async updateCollaboratorRole(id: number, role: string): Promise<Collaborator | undefined> {
    const [collaborator] = await db.update(collaborators).set({ role }).where(eq(collaborators.id, id)).returning();
    return collaborator || undefined;
  }

  async removeCollaborator(id: number): Promise<boolean> {
    const result = await db.delete(collaborators).where(eq(collaborators.id, id));
    return result.rowCount > 0;
  }

  // Default Tasks
  async createDefaultTask(task: InsertDefaultTask): Promise<DefaultTask> {
    const [result] = await db.insert(defaultTasks).values(task).returning();
    return result;
  }

  async getDefaultTasks(): Promise<DefaultTask[]> {
    return await db.select().from(defaultTasks).orderBy(defaultTasks.timeframeOrder, defaultTasks.category);
  }

  async seedDefaultTasks(): Promise<void> {
    // Check if default tasks already exist
    const existing = await db.select().from(defaultTasks).limit(1);
    if (existing.length > 0) {
      return; // Already seeded
    }

    // Default wedding checklist data from CSV
    const defaultTasksData: InsertDefaultTask[] = [
      // Budget & Planning
      { taskName: "Set overall budget", category: "Budget & Planning", timeframe: "12+ months before", timeframeOrder: 1 },
      { taskName: "Break down budget by category", category: "Budget & Planning", timeframe: "12+ months before", timeframeOrder: 1 },
      { taskName: "Track deposits and payment deadlines", category: "Budget & Planning", timeframe: "Ongoing", timeframeOrder: 0 },
      { taskName: "Set up wedding planning email address", category: "Budget & Planning", timeframe: "12+ months before", timeframeOrder: 1 },
      { taskName: "Hire a wedding planner or coordinator", category: "Budget & Planning", timeframe: "12+ months before", timeframeOrder: 1 },
      { taskName: "Create a planning timeline", category: "Budget & Planning", timeframe: "12+ months before", timeframeOrder: 1 },

      // Guest List & Invitations
      { taskName: "Draft initial guest list", category: "Guest List & Invitations", timeframe: "12+ months before", timeframeOrder: 1 },
      { taskName: "Finalize guest list", category: "Guest List & Invitations", timeframe: "10-12 months before", timeframeOrder: 2 },
      { taskName: "Collect mailing addresses", category: "Guest List & Invitations", timeframe: "10-12 months before", timeframeOrder: 2 },
      { taskName: "Send Save the Dates", category: "Guest List & Invitations", timeframe: "8-10 months before", timeframeOrder: 3 },
      { taskName: "Order invitations", category: "Guest List & Invitations", timeframe: "4-6 months before", timeframeOrder: 7 },
      { taskName: "Finalize invitation wording", category: "Guest List & Invitations", timeframe: "3-4 months before", timeframeOrder: 8 },
      { taskName: "Send invitations", category: "Guest List & Invitations", timeframe: "6-8 weeks before", timeframeOrder: 11 },
      { taskName: "Track RSVPs", category: "Guest List & Invitations", timeframe: "Ongoing after invitations sent", timeframeOrder: 12 },
      { taskName: "Send reminders to non-responders", category: "Guest List & Invitations", timeframe: "4 weeks before", timeframeOrder: 13 },
      { taskName: "Create seating chart", category: "Guest List & Invitations", timeframe: "2-3 weeks before", timeframeOrder: 14 },
      { taskName: "Prepare place cards or escort cards", category: "Guest List & Invitations", timeframe: "1-2 weeks before", timeframeOrder: 15 },

      // Ceremony
      { taskName: "Book venue/officiant", category: "Ceremony", timeframe: "12+ months before", timeframeOrder: 1 },
      { taskName: "Decide on ceremony structure", category: "Ceremony", timeframe: "6-9 months before", timeframeOrder: 4 },
      { taskName: "Write personal vows", category: "Ceremony", timeframe: "1-2 months before", timeframeOrder: 10 },
      { taskName: "Choose readings or rituals", category: "Ceremony", timeframe: "3-6 months before", timeframeOrder: 6 },
      { taskName: "Select music for processional, recessional", category: "Ceremony", timeframe: "2-3 months before", timeframeOrder: 9 },
      { taskName: "Confirm license requirements", category: "Ceremony", timeframe: "2-3 months before", timeframeOrder: 9 },
      { taskName: "Obtain marriage license", category: "Ceremony", timeframe: "1 month before", timeframeOrder: 16 },
      { taskName: "Buy a decorative marriage certificate", category: "Ceremony", timeframe: "1 month before", timeframeOrder: 16 },
      { taskName: "Purchase ceremony accessories", category: "Ceremony", timeframe: "2-3 months before", timeframeOrder: 9 },
      { taskName: "Plan ceremony rehearsal", category: "Ceremony", timeframe: "1-2 weeks before", timeframeOrder: 15 },

      // Reception
      { taskName: "Book reception venue", category: "Reception", timeframe: "12+ months before", timeframeOrder: 1 },
      { taskName: "Choose meal style", category: "Reception", timeframe: "6-9 months before", timeframeOrder: 4 },
      { taskName: "Finalize menu with caterer", category: "Reception", timeframe: "2 months before", timeframeOrder: 17 },
      { taskName: "Order alcohol/bar services", category: "Reception", timeframe: "2-3 months before", timeframeOrder: 9 },
      { taskName: "Choose first dance song", category: "Reception", timeframe: "2-3 months before", timeframeOrder: 9 },
      { taskName: "Choose parent dance songs", category: "Reception", timeframe: "2-3 months before", timeframeOrder: 9 },
      { taskName: "Create do-not-play and must-play list", category: "Reception", timeframe: "1-2 months before", timeframeOrder: 10 },
      { taskName: "Hire DJ/band", category: "Reception", timeframe: "9-12 months before", timeframeOrder: 2 },
      { taskName: "Rent or confirm equipment", category: "Reception", timeframe: "2-3 months before", timeframeOrder: 9 },
      { taskName: "Create reception timeline", category: "Reception", timeframe: "1 month before", timeframeOrder: 16 },
      { taskName: "Assign emcee or announcer", category: "Reception", timeframe: "1 month before", timeframeOrder: 16 },

      // Additional categories continue...
      { taskName: "Choose wedding theme or colors", category: "Decor & Rentals", timeframe: "10-12 months before", timeframeOrder: 2 },
      { taskName: "Rent tables, chairs, linens, dishware", category: "Decor & Rentals", timeframe: "3-6 months before", timeframeOrder: 6 },
      { taskName: "Order centerpieces", category: "Decor & Rentals", timeframe: "2-3 months before", timeframeOrder: 9 },
      { taskName: "Purchase signage", category: "Decor & Rentals", timeframe: "2-3 months before", timeframeOrder: 9 },
      { taskName: "Make or purchase table numbers", category: "Decor & Rentals", timeframe: "1 month before", timeframeOrder: 16 },
      { taskName: "Purchase guestbook and pens", category: "Decor & Rentals", timeframe: "1-2 months before", timeframeOrder: 10 },
      { taskName: "Arrange delivery/pickup logistics for rentals", category: "Decor & Rentals", timeframe: "2-3 weeks before", timeframeOrder: 14 },

      // Attire & Beauty
      { taskName: "Buy wedding dress or attire", category: "Attire & Beauty", timeframe: "9-12 months before", timeframeOrder: 2 },
      { taskName: "Schedule dress fittings", category: "Attire & Beauty", timeframe: "6-8 months before", timeframeOrder: 3 },
      { taskName: "Choose veil or accessories", category: "Attire & Beauty", timeframe: "3-6 months before", timeframeOrder: 6 },
      { taskName: "Buy shoes and break them in", category: "Attire & Beauty", timeframe: "2-3 months before", timeframeOrder: 9 },
      { taskName: "Order groom's attire", category: "Attire & Beauty", timeframe: "6 months before", timeframeOrder: 5 },
      { taskName: "Coordinate outfits for wedding party", category: "Attire & Beauty", timeframe: "6-9 months before", timeframeOrder: 4 },
      { taskName: "Book hair & makeup artist", category: "Attire & Beauty", timeframe: "6 months before", timeframeOrder: 5 },
      { taskName: "Schedule hair/makeup trial", category: "Attire & Beauty", timeframe: "2-3 months before", timeframeOrder: 9 },
      { taskName: "Finalize wedding day beauty timeline", category: "Attire & Beauty", timeframe: "1 month before", timeframeOrder: 16 },

      // Vendors
      { taskName: "Book photographer", category: "Vendors", timeframe: "9-12 months before", timeframeOrder: 2 },
      { taskName: "Book videographer", category: "Vendors", timeframe: "9-12 months before", timeframeOrder: 2 },
      { taskName: "Book florist", category: "Vendors", timeframe: "6-9 months before", timeframeOrder: 4 },
      { taskName: "Book caterer", category: "Vendors", timeframe: "9-12 months before", timeframeOrder: 2 },
      { taskName: "Book cake baker", category: "Vendors", timeframe: "6-9 months before", timeframeOrder: 4 },
      { taskName: "Book transportation", category: "Vendors", timeframe: "4-6 months before", timeframeOrder: 7 },
      { taskName: "Prepare vendor tips", category: "Vendors", timeframe: "1-2 weeks before", timeframeOrder: 15 },
      { taskName: "Confirm all contracts and arrival times", category: "Vendors", timeframe: "2-4 weeks before", timeframeOrder: 13 },

      // Final Tasks
      { taskName: "Final dress fitting", category: "Final Preparations", timeframe: "3-4 weeks before", timeframeOrder: 13 },
      { taskName: "Final RSVP count to caterer", category: "Final Preparations", timeframe: "3 weeks before", timeframeOrder: 14 },
      { taskName: "Print ceremony programs", category: "Final Preparations", timeframe: "2 weeks before", timeframeOrder: 17 },
      { taskName: "Pick up wedding rings", category: "Final Preparations", timeframe: "2 weeks before", timeframeOrder: 17 },
      { taskName: "Practice vows", category: "Final Preparations", timeframe: "1-2 weeks before", timeframeOrder: 15 },
      { taskName: "Create emergency day-of kit", category: "Final Preparations", timeframe: "1 week before", timeframeOrder: 18 },
      { taskName: "Prepare final payments and tips", category: "Final Preparations", timeframe: "1 week before", timeframeOrder: 18 },
      { taskName: "Schedule manicure/pedicure", category: "Final Preparations", timeframe: "2-3 days before", timeframeOrder: 19 },
      { taskName: "Steam/press outfits", category: "Final Preparations", timeframe: "1-2 days before", timeframeOrder: 20 },
    ];

    await db.insert(defaultTasks).values(defaultTasksData);
  }

  async createTasksFromTemplate(projectId: number, userId: number, weddingDate: Date): Promise<Task[]> {
    // Get all default tasks
    const defaultTasksList = await this.getDefaultTasks();
    
    // Calculate due dates based on wedding date and timeframe
    const tasksToCreate: InsertTask[] = defaultTasksList.map(defaultTask => {
      let dueDate: Date | null = null;
      
      // Calculate due date based on timeframe
      if (defaultTask.timeframe !== "Ongoing" && defaultTask.timeframe !== "As needed") {
        if (defaultTask.timeframe.includes("12+ months")) {
          dueDate = new Date(weddingDate.getTime() - (365 * 24 * 60 * 60 * 1000)); // 1 year before
        } else if (defaultTask.timeframe.includes("10-12 months")) {
          dueDate = new Date(weddingDate.getTime() - (320 * 24 * 60 * 60 * 1000)); // 11 months before
        } else if (defaultTask.timeframe.includes("9-12 months")) {
          dueDate = new Date(weddingDate.getTime() - (300 * 24 * 60 * 60 * 1000)); // 10 months before
        } else if (defaultTask.timeframe.includes("8-10 months")) {
          dueDate = new Date(weddingDate.getTime() - (270 * 24 * 60 * 60 * 1000)); // 9 months before
        } else if (defaultTask.timeframe.includes("6-9 months")) {
          dueDate = new Date(weddingDate.getTime() - (210 * 24 * 60 * 60 * 1000)); // 7 months before
        } else if (defaultTask.timeframe.includes("6-8 months")) {
          dueDate = new Date(weddingDate.getTime() - (210 * 24 * 60 * 60 * 1000)); // 7 months before
        } else if (defaultTask.timeframe.includes("6 months")) {
          dueDate = new Date(weddingDate.getTime() - (180 * 24 * 60 * 60 * 1000)); // 6 months before
        } else if (defaultTask.timeframe.includes("4-6 months")) {
          dueDate = new Date(weddingDate.getTime() - (150 * 24 * 60 * 60 * 1000)); // 5 months before
        } else if (defaultTask.timeframe.includes("3-6 months")) {
          dueDate = new Date(weddingDate.getTime() - (120 * 24 * 60 * 60 * 1000)); // 4 months before
        } else if (defaultTask.timeframe.includes("3-4 months")) {
          dueDate = new Date(weddingDate.getTime() - (105 * 24 * 60 * 60 * 1000)); // 3.5 months before
        } else if (defaultTask.timeframe.includes("2-3 months")) {
          dueDate = new Date(weddingDate.getTime() - (75 * 24 * 60 * 60 * 1000)); // 2.5 months before
        } else if (defaultTask.timeframe.includes("1-2 months")) {
          dueDate = new Date(weddingDate.getTime() - (45 * 24 * 60 * 60 * 1000)); // 1.5 months before
        } else if (defaultTask.timeframe.includes("1 month")) {
          dueDate = new Date(weddingDate.getTime() - (30 * 24 * 60 * 60 * 1000)); // 1 month before
        } else if (defaultTask.timeframe.includes("weeks")) {
          const weeksMatch = defaultTask.timeframe.match(/(\d+)/);
          if (weeksMatch) {
            const weeks = parseInt(weeksMatch[1]);
            dueDate = new Date(weddingDate.getTime() - (weeks * 7 * 24 * 60 * 60 * 1000));
          }
        } else if (defaultTask.timeframe.includes("days")) {
          const daysMatch = defaultTask.timeframe.match(/(\d+)/);
          if (daysMatch) {
            const days = parseInt(daysMatch[1]);
            dueDate = new Date(weddingDate.getTime() - (days * 24 * 60 * 60 * 1000));
          }
        }
      }

      return {
        projectId,
        title: defaultTask.taskName,
        description: `${defaultTask.category} task - ${defaultTask.timeframe}`,
        category: defaultTask.category,
        priority: 'medium',
        status: 'pending',
        dueDate,
        defaultTimeframe: defaultTask.timeframe,
        timeframeOrder: defaultTask.timeframeOrder,
        isFromTemplate: true,
        defaultTaskId: defaultTask.id,
        createdBy: userId,
        notes: null,
        isCompleted: false,
      };
    });

    // Insert all tasks
    const result = await db.insert(tasks).values(tasksToCreate).returning();
    return result;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(insertTask).returning();
    return task;
  }

  async getTaskById(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async getTasksByProjectId(projectId: number): Promise<Task[]> {
    return await db.select().from(tasks)
      .where(eq(tasks.projectId, projectId))
      .orderBy(
        sql`${tasks.timeframeOrder} ASC NULLS LAST`,
        tasks.dueDate,
        tasks.createdAt
      );
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const [task] = await db.update(tasks).set({
      ...updates,
      updatedAt: new Date(),
    }).where(eq(tasks.id, id)).returning();
    return task || undefined;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return result.rowCount > 0;
  }

  async completeTask(id: number): Promise<Task | undefined> {
    const [task] = await db.update(tasks).set({ 
      status: 'completed',
      isCompleted: true, 
      completedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(tasks.id, id)).returning();
    return task || undefined;
  }

  async createGuest(insertGuest: InsertGuest): Promise<Guest> {
    const [guest] = await db.insert(guests).values(insertGuest).returning();
    return guest;
  }

  async getGuestById(id: number): Promise<Guest | undefined> {
    const [guest] = await db.select().from(guests).where(eq(guests.id, id));
    return guest || undefined;
  }

  async getGuestsByProjectId(projectId: number): Promise<Guest[]> {
    return await db.select().from(guests).where(eq(guests.projectId, projectId));
  }

  async updateGuest(id: number, updates: Partial<InsertGuest>): Promise<Guest | undefined> {
    const [guest] = await db.update(guests).set(updates).where(eq(guests.id, id)).returning();
    return guest || undefined;
  }

  async deleteGuest(id: number): Promise<boolean> {
    const result = await db.delete(guests).where(eq(guests.id, id));
    return result.rowCount > 0;
  }

  async updateGuestRsvp(id: number, status: string, mealPreference?: string): Promise<Guest | undefined> {
    const [guest] = await db.update(guests).set({ 
      rsvpStatus: status, 
      ...(mealPreference && { mealPreference }) 
    }).where(eq(guests.id, id)).returning();
    return guest || undefined;
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const [vendor] = await db.insert(vendors).values(insertVendor).returning();
    return vendor;
  }

  async getVendorsByProjectId(projectId: number): Promise<Vendor[]> {
    return await db.select().from(vendors).where(eq(vendors.projectId, projectId));
  }

  async updateVendor(id: number, updates: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const [vendor] = await db.update(vendors).set(updates).where(eq(vendors.id, id)).returning();
    return vendor || undefined;
  }

  async deleteVendor(id: number): Promise<boolean> {
    const result = await db.delete(vendors).where(eq(vendors.id, id));
    return result.rowCount > 0;
  }

  async createBudgetItem(insertItem: InsertBudgetItem): Promise<BudgetItem> {
    const [item] = await db.insert(budgetItems).values(insertItem).returning();
    return item;
  }

  async getBudgetItemsByProjectId(projectId: number): Promise<BudgetItem[]> {
    return await db.select().from(budgetItems).where(eq(budgetItems.projectId, projectId));
  }

  async updateBudgetItem(id: number, updates: Partial<InsertBudgetItem>): Promise<BudgetItem | undefined> {
    const [item] = await db.update(budgetItems).set(updates).where(eq(budgetItems.id, id)).returning();
    return item || undefined;
  }

  async deleteBudgetItem(id: number): Promise<boolean> {
    const result = await db.delete(budgetItems).where(eq(budgetItems.id, id));
    return result.rowCount > 0;
  }

  async createTimelineEvent(insertEvent: InsertTimelineEvent): Promise<TimelineEvent> {
    const [event] = await db.insert(timelineEvents).values(insertEvent).returning();
    return event;
  }

  async getTimelineEventsByProjectId(projectId: number): Promise<TimelineEvent[]> {
    return await db.select().from(timelineEvents).where(eq(timelineEvents.projectId, projectId));
  }

  async updateTimelineEvent(id: number, updates: Partial<InsertTimelineEvent>): Promise<TimelineEvent | undefined> {
    const [event] = await db.update(timelineEvents).set(updates).where(eq(timelineEvents.id, id)).returning();
    return event || undefined;
  }

  async deleteTimelineEvent(id: number): Promise<boolean> {
    const result = await db.delete(timelineEvents).where(eq(timelineEvents.id, id));
    return result.rowCount > 0;
  }

  async createInspirationItem(insertItem: InsertInspirationItem): Promise<InspirationItem> {
    const [item] = await db.insert(inspirationItems).values(insertItem).returning();
    return item;
  }

  async getInspirationItemsByProjectId(projectId: number): Promise<InspirationItem[]> {
    return await db.select().from(inspirationItems).where(eq(inspirationItems.projectId, projectId));
  }

  async getInspirationItemById(id: number): Promise<InspirationItem | undefined> {
    const [item] = await db.select().from(inspirationItems).where(eq(inspirationItems.id, id));
    return item || undefined;
  }

  async updateInspirationItem(id: number, updates: Partial<InsertInspirationItem>): Promise<InspirationItem | undefined> {
    const [item] = await db.update(inspirationItems).set(updates).where(eq(inspirationItems.id, id)).returning();
    return item || undefined;
  }

  async deleteInspirationItem(id: number): Promise<boolean> {
    const result = await db.delete(inspirationItems).where(eq(inspirationItems.id, id));
    return result.rowCount > 0;
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db.insert(activities).values(insertActivity).returning();
    return activity;
  }

  async getActivitiesByProjectId(projectId: number): Promise<(Activity & { user: User })[]> {
    const result = await db
      .select({
        id: activities.id,
        projectId: activities.projectId,
        userId: activities.userId,
        action: activities.action,
        target: activities.target,
        targetId: activities.targetId,
        details: activities.details,
        createdAt: activities.createdAt,
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
          avatar: users.avatar,
          password: users.password,
          createdAt: users.createdAt,
        }
      })
      .from(activities)
      .innerJoin(users, eq(activities.userId, users.id))
      .where(eq(activities.projectId, projectId));

    return result.map(row => ({
      ...row,
      user: row.user
    }));
  }

  // Shopping Lists
  async createShoppingList(insertList: InsertShoppingList): Promise<ShoppingList> {
    const [list] = await db.insert(shoppingLists).values(insertList).returning();
    return list;
  }

  async getShoppingListsByProjectId(projectId: number): Promise<ShoppingList[]> {
    return await db.select().from(shoppingLists).where(eq(shoppingLists.projectId, projectId));
  }

  async updateShoppingList(id: number, updates: Partial<InsertShoppingList>): Promise<ShoppingList | undefined> {
    const [list] = await db.update(shoppingLists).set(updates).where(eq(shoppingLists.id, id)).returning();
    return list || undefined;
  }

  async deleteShoppingList(id: number): Promise<boolean> {
    const result = await db.delete(shoppingLists).where(eq(shoppingLists.id, id));
    return result.rowCount > 0;
  }

  // Shopping Items
  async createShoppingItem(insertItem: InsertShoppingItem): Promise<ShoppingItem> {
    const [item] = await db.insert(shoppingItems).values(insertItem).returning();
    return item;
  }

  async getShoppingItemsByProjectId(projectId: number): Promise<ShoppingItem[]> {
    return await db.select().from(shoppingItems).where(eq(shoppingItems.projectId, projectId));
  }

  async getShoppingItemsByListId(listId: number): Promise<ShoppingItem[]> {
    return await db.select().from(shoppingItems).where(eq(shoppingItems.listId, listId));
  }

  async updateShoppingItem(id: number, updates: Partial<InsertShoppingItem>): Promise<ShoppingItem | undefined> {
    const [item] = await db.update(shoppingItems).set(updates).where(eq(shoppingItems.id, id)).returning();
    return item || undefined;
  }

  async deleteShoppingItem(id: number): Promise<boolean> {
    const result = await db.delete(shoppingItems).where(eq(shoppingItems.id, id));
    return result.rowCount > 0;
  }

  async markItemPurchased(id: number): Promise<ShoppingItem | undefined> {
    const [item] = await db.update(shoppingItems).set({ 
      status: 'purchased', 
      purchasedDate: new Date() 
    }).where(eq(shoppingItems.id, id)).returning();
    return item || undefined;
  }

  // Schedules
  async createSchedule(insertSchedule: InsertSchedule): Promise<Schedule> {
    const [schedule] = await db.insert(schedules).values(insertSchedule).returning();
    return schedule;
  }

  async getSchedulesByProjectId(projectId: number): Promise<Schedule[]> {
    return await db.select().from(schedules).where(eq(schedules.projectId, projectId));
  }

  async getScheduleById(id: number): Promise<Schedule | undefined> {
    const [schedule] = await db.select().from(schedules).where(eq(schedules.id, id));
    return schedule || undefined;
  }

  async updateSchedule(id: number, updates: Partial<InsertSchedule>): Promise<Schedule | undefined> {
    const [schedule] = await db.update(schedules).set(updates).where(eq(schedules.id, id)).returning();
    return schedule || undefined;
  }

  async deleteSchedule(id: number): Promise<boolean> {
    const result = await db.delete(schedules).where(eq(schedules.id, id));
    return result.rowCount > 0;
  }

  // Schedule Events
  async createScheduleEvent(insertEvent: InsertScheduleEvent): Promise<ScheduleEvent> {
    const [event] = await db.insert(scheduleEvents).values(insertEvent).returning();
    return event;
  }

  async getScheduleEventsByScheduleId(scheduleId: number): Promise<ScheduleEvent[]> {
    return await db.select().from(scheduleEvents).where(eq(scheduleEvents.scheduleId, scheduleId));
  }

  async updateScheduleEvent(id: number, updates: Partial<InsertScheduleEvent>): Promise<ScheduleEvent | undefined> {
    const [event] = await db.update(scheduleEvents).set(updates).where(eq(scheduleEvents.id, id)).returning();
    return event || undefined;
  }

  async deleteScheduleEvent(id: number): Promise<boolean> {
    const result = await db.delete(scheduleEvents).where(eq(scheduleEvents.id, id));
    return result.rowCount > 0;
  }

  // Intake Data methods
  async createIntakeData(insertData: InsertIntakeData): Promise<IntakeData> {
    const [data] = await db
      .insert(intakeData)
      .values(insertData)
      .returning();
    return data;
  }

  async getIntakeDataByUserId(userId: number): Promise<IntakeData | undefined> {
    const [data] = await db.select().from(intakeData).where(eq(intakeData.userId, userId));
    return data || undefined;
  }

  async updateIntakeData(userId: number, updates: Partial<InsertIntakeData>): Promise<IntakeData | undefined> {
    const [data] = await db
      .update(intakeData)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(intakeData.userId, userId))
      .returning();
    return data || undefined;
  }

  async markUserIntakeComplete(userId: number): Promise<boolean> {
    try {
      await db
        .update(users)
        .set({ hasCompletedIntake: true })
        .where(eq(users.id, userId));
      return true;
    } catch (error) {
      console.error('Error marking user intake complete:', error);
      return false;
    }
  }

  async createWeddingOverview(insertOverview: InsertWeddingOverview): Promise<WeddingOverview> {
    const [overview] = await db.insert(weddingOverview).values(insertOverview).returning();
    return overview;
  }

  async getWeddingOverviewByProjectId(projectId: number): Promise<WeddingOverview | undefined> {
    const [overview] = await db.select().from(weddingOverview).where(eq(weddingOverview.projectId, projectId));
    return overview || undefined;
  }

  async updateWeddingOverview(projectId: number, updates: Partial<InsertWeddingOverview>): Promise<WeddingOverview | undefined> {
    const [overview] = await db
      .update(weddingOverview)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(weddingOverview.projectId, projectId))
      .returning();
    return overview || undefined;
  }
}

export const storage = new DatabaseStorage();
