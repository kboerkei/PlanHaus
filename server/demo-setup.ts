import { storage } from "./storage";

export async function setupDemoData() {
  // Check if demo user already exists
  let demoUser = await storage.getUserByEmail("demo@example.com");
  
  if (!demoUser) {
    // Create demo user only if it doesn't exist
    demoUser = await storage.createUser({
      username: "Demo User",
      email: "demo@example.com",
      password: "demo123",
      avatar: null,
    });
  }

  // Check if demo project already exists
  const existingProjects = await storage.getWeddingProjectsByUserId(demoUser.id);
  let demoProject = existingProjects.find(p => p.name === "Sarah & Alex's Wedding");
  
  if (!demoProject) {
    // Create a demo wedding project only if it doesn't exist
    demoProject = await storage.createWeddingProject({
      name: "Sarah & Alex's Wedding",
      description: "A beautiful garden wedding celebration",
      date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
      budget: "50000",
      venue: "Rose Garden Estate",
      theme: "Garden Romance",
      guestCount: 120,
      style: "Classic & Elegant",
      createdBy: demoUser.id,
    });
  }

  // Check if demo data already exists for this project
  const existingTasks = await storage.getTasksByProjectId(demoProject.id);
  const existingGuests = await storage.getGuestsByProjectId(demoProject.id);
  const existingVendors = await storage.getVendorsByProjectId(demoProject.id);
  const existingBudgetItems = await storage.getBudgetItemsByProjectId(demoProject.id);
  const existingSchedules = await storage.getSchedulesByProjectId(demoProject.id);

  // Add demo tasks only if none exist
  if (existingTasks.length === 0) {
    await storage.createTask({
      title: "Book photographer",
      description: "Find and book a wedding photographer",
      status: "pending",
      category: "Photography",
      priority: "high",
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 2 months from now
      createdBy: demoUser.id,
      projectId: demoProject.id,
    });

    await storage.createTask({
      title: "Order wedding cake",
      description: "Decide on flavor and design for wedding cake",
      status: "pending",
      category: "Catering",
      priority: "medium",
      dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months from now
      createdBy: demoUser.id,
      projectId: demoProject.id,
    });
  }

  // Add demo guests only if none exist
  if (existingGuests.length === 0) {
    await storage.createGuest({
      name: "Emily Johnson",
      email: "emily@example.com",
      phone: "(555) 123-4567",
      rsvpStatus: "confirmed",
      projectId: demoProject.id,
      addedBy: demoUser.id,
    });

    await storage.createGuest({
      name: "Michael Smith",
      email: "michael@example.com",
      rsvpStatus: "pending",
      projectId: demoProject.id,
      addedBy: demoUser.id,
    });
  }

  // Add demo vendors only if none exist
  if (existingVendors.length === 0) {
    await storage.createVendor({
      name: "Bloom & Blossom Florists",
      category: "Florist",
      email: "info@bloomflorists.com",
      phone: "(555) 987-6543",
      status: "contacted",
      quote: "2500",
      projectId: demoProject.id,
      addedBy: demoUser.id,
    });
  }

  // Add demo budget items only if none exist
  if (existingBudgetItems.length === 0) {
    await storage.createBudgetItem({
      category: "Venue",
      item: "Rose Garden Estate rental",
      estimatedCost: "15000",
      actualCost: "15000",
      isPaid: true,
      createdBy: demoUser.id,
      projectId: demoProject.id,
    });

    await storage.createBudgetItem({
      category: "Photography",
      item: "Wedding photographer",
      estimatedCost: "3000",
      createdBy: demoUser.id,
      projectId: demoProject.id,
    });
  }

  // Add demo schedules only if none exist
  if (existingSchedules.length === 0) {
    const weddingDaySchedule = await storage.createSchedule({
      name: "Wedding Day",
      date: demoProject.date,
      type: "wedding-day",
      description: "The main wedding ceremony and reception",
      location: "Rose Garden Estate",
      projectId: demoProject.id,
      createdBy: demoUser.id
    });

    const rehearsalSchedule = await storage.createSchedule({
      name: "Rehearsal Dinner",
      date: new Date(demoProject.date.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day before wedding
      type: "rehearsal",
      description: "Rehearsal dinner with close family and friends",
      location: "Sunset Terrace Restaurant",
      projectId: demoProject.id,
      createdBy: demoUser.id
    });

    // Add events to wedding day schedule
    await storage.createScheduleEvent({
      title: "Hair & Makeup",
      description: "Bridal party getting ready",
      startTime: new Date(`2000-01-01T08:00:00`),
      endTime: new Date(`2000-01-01T11:00:00`),
      location: "Bridal Suite",
      type: "preparation",
      notes: "Professional makeup artist and hair stylist",
      scheduleId: weddingDaySchedule.id,
      projectId: demoProject.id,
      createdBy: demoUser.id
    });

    await storage.createScheduleEvent({
      title: "Ceremony",
      description: "Wedding ceremony in the garden",
      startTime: new Date(`2000-01-01T16:00:00`),
      endTime: new Date(`2000-01-01T17:00:00`),
      location: "Rose Garden",
      type: "ceremony",
      notes: "Outdoor ceremony weather permitting",
      scheduleId: weddingDaySchedule.id,
      projectId: demoProject.id,
      createdBy: demoUser.id
    });

    await storage.createScheduleEvent({
      title: "Reception",
      description: "Wedding reception with dinner and dancing",
      startTime: new Date(`2000-01-01T18:00:00`),
      endTime: new Date(`2000-01-01T23:00:00`),
      location: "Grand Ballroom",
      type: "reception",
      notes: "Cocktail hour followed by dinner and dancing",
      scheduleId: weddingDaySchedule.id,
      projectId: demoProject.id,
      createdBy: demoUser.id
    });

    // Add events to rehearsal schedule
    await storage.createScheduleEvent({
      title: "Rehearsal",
      description: "Wedding ceremony rehearsal",
      startTime: new Date(`2000-01-01T17:00:00`),
      endTime: new Date(`2000-01-01T18:00:00`),
      location: "Rose Garden",
      type: "ceremony",
      notes: "Practice ceremony with wedding party",
      scheduleId: rehearsalSchedule.id,
      projectId: demoProject.id,
      createdBy: demoUser.id
    });

    await storage.createScheduleEvent({
      title: "Rehearsal Dinner",
      description: "Dinner with close family and friends",
      startTime: new Date(`2000-01-01T19:00:00`),
      endTime: new Date(`2000-01-01T22:00:00`),
      location: "Sunset Terrace Restaurant",
      type: "reception",
      notes: "Casual dinner and toasts",
      scheduleId: rehearsalSchedule.id,
      projectId: demoProject.id,
      createdBy: demoUser.id
    });
  }

  console.log("Demo data setup complete!");
  return { demoUser, demoProject };
}