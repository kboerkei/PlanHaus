// Simple in-memory storage for development
export class MemoryStorage {
  private users: any[] = [];
  private projects: any[] = [];
  private tasks: any[] = [];
  private guests: any[] = [];
  private vendors: any[] = [];
  private budgetItems: any[] = [];
  private intakeData: any[] = [];
  private seatingTables: any[] = [];
  private seatingAssignments: any[] = [];
  private schedules: any[] = [];
  private scheduleEvents: any[] = [];
  private sessions: any[] = [];
  private weddingOverviews: any[] = [];
  private creativeDetails: any[] = [];

  // Users
  async createUser(user: any): Promise<any> {
    const newUser = { ...user, id: this.users.length + 1, createdAt: new Date(), updatedAt: new Date() };
    this.users.push(newUser);
    return newUser;
  }

  async getUserByEmail(email: string): Promise<any | undefined> {
    return this.users.find(u => u.email === email);
  }

  async getUserById(id: number): Promise<any | undefined> {
    return this.users.find(u => u.id === id);
  }

  // Sessions
  async createSession(session: any): Promise<any> {
    const newSession = { ...session, id: this.sessions.length + 1, createdAt: new Date() };
    this.sessions.push(newSession);
    return newSession;
  }

  async getSessionById(sessionId: string): Promise<any | undefined> {
    return this.sessions.find(s => s.sessionId === sessionId);
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const index = this.sessions.findIndex(s => s.sessionId === sessionId);
    if (index > -1) {
      this.sessions.splice(index, 1);
      return true;
    }
    return false;
  }

  // Wedding Projects
  async createWeddingProject(project: any): Promise<any> {
    const newProject = { ...project, id: this.projects.length + 1, createdAt: new Date() };
    this.projects.push(newProject);
    return newProject;
  }

  async getWeddingProjectsByUserId(userId: number): Promise<any[]> {
    return this.projects.filter(p => p.createdBy === userId);
  }

  async getWeddingProjectById(id: number): Promise<any | undefined> {
    return this.projects.find(p => p.id === id);
  }

  async deleteWeddingProject(id: number): Promise<boolean> {
    const index = this.projects.findIndex(p => p.id === id);
    if (index > -1) {
      this.projects.splice(index, 1);
      return true;
    }
    return false;
  }

  // Tasks
  async createTask(task: any): Promise<any> {
    const newTask = { ...task, id: this.tasks.length + 1, createdAt: new Date(), updatedAt: new Date() };
    this.tasks.push(newTask);
    return newTask;
  }

  async getTasksByProjectId(projectId: number): Promise<any[]> {
    return this.tasks.filter(t => t.projectId === projectId);
  }

  async updateTask(id: number, updates: any): Promise<any | undefined> {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      Object.assign(task, updates, { updatedAt: new Date() });
      return task;
    }
    return undefined;
  }

  async deleteTask(id: number): Promise<boolean> {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index > -1) {
      this.tasks.splice(index, 1);
      return true;
    }
    return false;
  }

  // Guests
  async createGuest(guest: any): Promise<any> {
    const newGuest = { ...guest, id: this.guests.length + 1, createdAt: new Date(), updatedAt: new Date() };
    this.guests.push(newGuest);
    return newGuest;
  }

  async getGuestsByProjectId(projectId: number): Promise<any[]> {
    return this.guests.filter(g => g.projectId === projectId);
  }

  async getGuestById(id: number): Promise<any | undefined> {
    return this.guests.find(g => g.id === id);
  }

  async updateGuest(id: number, updates: any): Promise<any | undefined> {
    const guest = this.guests.find(g => g.id === id);
    if (guest) {
      Object.assign(guest, updates, { updatedAt: new Date() });
      return guest;
    }
    return undefined;
  }

  async deleteGuest(id: number): Promise<boolean> {
    const index = this.guests.findIndex(g => g.id === id);
    if (index > -1) {
      this.guests.splice(index, 1);
      return true;
    }
    return false;
  }

  // Vendors
  async createVendor(vendor: any): Promise<any> {
    const newVendor = { ...vendor, id: this.vendors.length + 1, createdAt: new Date(), updatedAt: new Date() };
    this.vendors.push(newVendor);
    return newVendor;
  }

  async getVendorsByProjectId(projectId: number): Promise<any[]> {
    return this.vendors.filter(v => v.projectId === projectId);
  }

  async updateVendor(id: number, updates: any): Promise<any | undefined> {
    const vendor = this.vendors.find(v => v.id === id);
    if (vendor) {
      Object.assign(vendor, updates, { updatedAt: new Date() });
      return vendor;
    }
    return undefined;
  }

  async deleteVendor(id: number): Promise<boolean> {
    const index = this.vendors.findIndex(v => v.id === id);
    if (index > -1) {
      this.vendors.splice(index, 1);
      return true;
    }
    return false;
  }

  // Budget Items
  async createBudgetItem(item: any): Promise<any> {
    const newItem = { ...item, id: this.budgetItems.length + 1, createdAt: new Date(), updatedAt: new Date() };
    this.budgetItems.push(newItem);
    return newItem;
  }

  async getBudgetItemsByProjectId(projectId: number): Promise<any[]> {
    return this.budgetItems.filter(b => b.projectId === projectId);
  }

  async updateBudgetItem(id: number, updates: any): Promise<any | undefined> {
    const item = this.budgetItems.find(b => b.id === id);
    if (item) {
      Object.assign(item, updates, { updatedAt: new Date() });
      return item;
    }
    return undefined;
  }

  async deleteBudgetItem(id: number): Promise<boolean> {
    const index = this.budgetItems.findIndex(b => b.id === id);
    if (index > -1) {
      this.budgetItems.splice(index, 1);
      return true;
    }
    return false;
  }

  // Seating Chart
  async getSeatingChartData(projectId: number): Promise<any> {
    const tables = this.seatingTables.filter(t => t.projectId === projectId);
    const assignments = this.seatingAssignments.filter(a => a.projectId === projectId);
    const guests = this.guests.filter(g => g.projectId === projectId);

    const assignmentsWithGuests = assignments.map(assignment => {
      const guest = guests.find(g => g.id === assignment.guestId);
      return {
        ...assignment,
        guest: guest ? { id: guest.id, name: guest.name, email: guest.email } : null
      };
    });

    const assignedGuestIds = new Set(assignments.map(a => a.guestId));
    const unassignedGuests = guests.filter(guest => !assignedGuestIds.has(guest.id));

    return {
      tables,
      assignments: assignmentsWithGuests,
      unassignedGuests,
    };
  }

  async createSeatingTable(table: any): Promise<any> {
    const newTable = { ...table, id: this.seatingTables.length + 1, createdAt: new Date() };
    this.seatingTables.push(newTable);
    return newTable;
  }

  async createSeatingAssignment(assignment: any): Promise<any> {
    const newAssignment = { ...assignment, id: this.seatingAssignments.length + 1, createdAt: new Date() };
    this.seatingAssignments.push(newAssignment);
    return newAssignment;
  }

  // Schedules
  async getSchedulesByProjectId(projectId: number): Promise<any[]> {
    return this.schedules.filter(s => s.projectId === projectId);
  }

  async createSchedule(schedule: any): Promise<any> {
    const newSchedule = { ...schedule, id: this.schedules.length + 1, createdAt: new Date() };
    this.schedules.push(newSchedule);
    return newSchedule;
  }

  // Intake Data
  async createIntakeData(data: any): Promise<any> {
    const newIntake = { ...data, id: this.intakeData.length + 1, createdAt: new Date(), updatedAt: new Date() };
    this.intakeData.push(newIntake);
    return newIntake;
  }

  async getIntakeDataByUserId(userId: number): Promise<any | undefined> {
    return this.intakeData.find(i => i.userId === userId);
  }

  async markUserIntakeComplete(userId: number): Promise<void> {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.hasCompletedIntake = true;
    }
  }

  // Stub methods for compatibility
  async cleanExpiredSessions(): Promise<void> {
    // Remove sessions older than 24 hours
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.sessions = this.sessions.filter(s => new Date(s.createdAt) > cutoff);
  }

  // Project roles
  async getUserProjectRole(userId: number, projectId: number): Promise<string | undefined> {
    const project = this.projects.find(p => p.id === projectId);
    if (project && project.createdBy === userId) {
      return 'admin';
    }
    return undefined;
  }

  // Activity logging
  async logActivity(activity: any): Promise<any> {
    // Simple activity logging for demo
    console.log(`[ACTIVITY] ${activity.action} by user ${activity.userId}: ${activity.entityType} ${activity.entityId}`);
    return { id: Date.now(), ...activity };
  }

  // Default tasks
  async getDefaultTasks(): Promise<any[]> {
    return [];
  }

  async seedDefaultTasks(): Promise<void> {
    // No-op for demo
  }

  // Collaborators
  async addCollaborator(collaborator: any): Promise<any> {
    return { id: Date.now(), ...collaborator };
  }

  async getCollaboratorsByProjectId(projectId: number): Promise<any[]> {
    return [];
  }

  // Schedule Events
  async getScheduleEventsByScheduleId(scheduleId: number): Promise<any[]> {
    return this.scheduleEvents.filter(se => se.scheduleId === scheduleId);
  }

  async createScheduleEvent(event: any): Promise<any> {
    const newEvent = { ...event, id: this.scheduleEvents.length + 1, createdAt: new Date() };
    this.scheduleEvents.push(newEvent);
    return newEvent;
  }



  async updateCollaboratorRole(id: number, role: string): Promise<any | undefined> {
    return { id, role };
  }

  async removeCollaborator(id: number): Promise<boolean> {
    return true;
  }

  // Invitations
  async createInvitation(invitation: any): Promise<any> {
    return { id: Date.now(), ...invitation };
  }

  async getInvitationByToken(token: string): Promise<any | undefined> {
    return undefined;
  }

  async acceptInvitation(token: string, userId: number): Promise<{ success: boolean; collaborator?: any }> {
    return { success: false };
  }

  async cancelInvitation(id: number): Promise<boolean> {
    return true;
  }

  async getInvitationsByProjectId(projectId: number): Promise<any[]> {
    return [];
  }

  // Timeline events
  async createTimelineEvent(event: any): Promise<any> {
    return { id: Date.now(), ...event };
  }

  async getTimelineEventsByProjectId(projectId: number): Promise<any[]> {
    return [];
  }

  async updateTimelineEvent(id: number, updates: any): Promise<any | undefined> {
    return { id, ...updates };
  }

  async deleteTimelineEvent(id: number): Promise<boolean> {
    return true;
  }

  // Inspiration items
  async createInspirationItem(item: any): Promise<any> {
    return { id: Date.now(), ...item };
  }

  async getInspirationItemsByProjectId(projectId: number): Promise<any[]> {
    return [];
  }

  async updateInspirationItem(id: number, updates: any): Promise<any | undefined> {
    return { id, ...updates };
  }

  async deleteInspirationItem(id: number): Promise<boolean> {
    return true;
  }

  // Creative Details
  async createCreativeDetail(detail: any): Promise<any> {
    const newDetail = { 
      id: this.creativeDetails.length + 1, 
      ...detail, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.creativeDetails.push(newDetail);
    return newDetail;
  }

  async getCreativeDetails(projectId: number): Promise<any[]> {
    return this.creativeDetails.filter(d => d.projectId === projectId);
  }

  async getCreativeDetailById(id: number): Promise<any | undefined> {
    return this.creativeDetails.find(d => d.id === id);
  }

  async updateCreativeDetail(id: number, updates: any): Promise<any | undefined> {
    const detail = this.creativeDetails.find(d => d.id === id);
    if (detail) {
      Object.assign(detail, updates, { updatedAt: new Date() });
      return detail;
    }
    return undefined;
  }

  async deleteCreativeDetail(id: number): Promise<boolean> {
    const index = this.creativeDetails.findIndex(d => d.id === id);
    if (index > -1) {
      this.creativeDetails.splice(index, 1);
      return true;
    }
    return false;
  }

  // Wedding Overview
  async createWeddingOverview(overview: any): Promise<any> {
    const newOverview = { 
      id: this.weddingOverviews.length + 1, 
      ...overview, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.weddingOverviews.push(newOverview);
    return newOverview;
  }

  async getWeddingOverviewByProjectId(projectId: number): Promise<any | undefined> {
    return this.weddingOverviews.find(o => o.projectId === projectId);
  }

  async updateWeddingOverview(projectId: number, updates: any): Promise<any | undefined> {
    const overview = this.weddingOverviews.find(o => o.projectId === projectId);
    if (overview) {
      Object.assign(overview, updates, { updatedAt: new Date() });
      return overview;
    }
    return undefined;
  }

  // Schedule methods
  async getScheduleById(id: number): Promise<any | undefined> {
    return this.schedules.find(s => s.id === id);
  }

  async updateSchedule(id: number, updates: any): Promise<any | undefined> {
    const schedule = this.schedules.find(s => s.id === id);
    if (schedule) {
      Object.assign(schedule, updates, { updatedAt: new Date() });
      return schedule;
    }
    return undefined;
  }

  async deleteSchedule(id: number): Promise<boolean> {
    const index = this.schedules.findIndex(s => s.id === id);
    if (index > -1) {
      this.schedules.splice(index, 1);
      return true;
    }
    return false;
  }
} 