// Simple in-memory storage for development
export class MemoryStorage {
  private users: any[] = [];
  private projects: any[] = [];
  private tasks: any[] = [];
  private guests: any[] = [];
  private vendors: any[] = [];
  private budgetItems: any[] = [];
  private intakeData: any[] = [];

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

  // Stub methods for compatibility
  async getSchedulesByProjectId(projectId: number): Promise<any[]> {
    return [];
  }

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
} 