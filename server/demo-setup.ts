import { storage } from "./storage";

export async function setupDemoData() {
  // Only create demo data for the specific demo user account
  let demoUser = await storage.getUserByEmail("demo@example.com");
  
  if (!demoUser) {
    // Create demo user only if it doesn't exist
    demoUser = await storage.createUser({
      username: "Demo User",
      email: "demo@example.com",
      password: "demo123",
      avatar: null,
    });
  } else {
    // Demo user exists - check if we need to update to Austin farmhouse demo
    console.log("Demo user exists, checking for Austin farmhouse wedding project...");
  }

  // Force creation of Austin farmhouse wedding if it doesn't exist

  // Check if Austin farmhouse demo project exists
  const existingProjects = await storage.getWeddingProjectsByUserId(demoUser.id);
  let demoProject = existingProjects.find(p => p.name === "Emma & Jake's Wedding");
  
  console.log(`Found ${existingProjects.length} existing projects for demo user`);
  console.log(`Austin farmhouse project exists: ${!!demoProject}`);
  
  if (!demoProject) {
    // Check if we have old demo projects to replace
    const hasOldProjects = existingProjects.length > 0;
    if (hasOldProjects) {
      console.log(`Found ${existingProjects.length} old demo projects. Creating Austin farmhouse wedding...`);
    }
    
    // Create Austin farmhouse wedding demo project
    demoProject = await storage.createWeddingProject({
      name: "Emma & Jake's Wedding",
      description: "A charming farmhouse wedding in the heart of Austin, Texas with rolling hills, string lights, and rustic elegance",
      date: new Date("2025-10-15T18:00:00.000Z"), // October 15, 2025
      budget: "45000",
      venue: "Sunset Ranch Austin",
      theme: "Rustic Farmhouse",
      guestCount: 85,
      style: "Rustic Chic",
      createdBy: demoUser.id,
    });
  }

  // Check if demo data already exists
  const existingTasks = await storage.getTasksByProjectId(demoProject.id);
  const existingGuests = await storage.getGuestsByProjectId(demoProject.id);
  const existingVendors = await storage.getVendorsByProjectId(demoProject.id);
  const existingBudgetItems = await storage.getBudgetItemsByProjectId(demoProject.id);
  const existingSchedules = await storage.getSchedulesByProjectId(demoProject.id);

  // Add comprehensive demo tasks (75% complete) only if none exist
  if (existingTasks.length === 0) {
    // Completed tasks (showing progress)
    await storage.createTask({
      title: "Book venue - Sunset Ranch Austin",
      description: "Secured our dream farmhouse venue in Austin Hills",
      status: "completed",
      category: "Venue",
      priority: "high",
      dueDate: new Date("2025-01-15T00:00:00.000Z"),
      completedAt: new Date("2025-01-12T00:00:00.000Z"),
      createdBy: demoUser.id,
      projectId: demoProject.id,
    });

    await storage.createTask({
      title: "Hire photographer - Sarah Chen Photography",
      description: "Booked Austin-based photographer specializing in natural farmhouse style",
      status: "completed",
      category: "Photography",
      priority: "high",
      dueDate: new Date("2025-02-01T00:00:00.000Z"),
      completedAt: new Date("2025-01-28T00:00:00.000Z"),
      createdBy: demoUser.id,
      projectId: demoProject.id,
    });

    await storage.createTask({
      title: "Order save-the-dates",
      description: "Rustic kraft paper save-the-dates with barn illustration",
      status: "completed",
      category: "Invitations",
      priority: "medium",
      dueDate: new Date("2025-03-15T00:00:00.000Z"),
      completedAt: new Date("2025-03-10T00:00:00.000Z"),
      createdBy: demoUser.id,
      projectId: demoProject.id,
    });

    await storage.createTask({
      title: "Book caterer - Hill Country Catering",
      description: "Secured Texas BBQ and southern comfort food menu",
      status: "completed",
      category: "Catering",
      priority: "high",
      dueDate: new Date("2025-04-01T00:00:00.000Z"),
      completedAt: new Date("2025-03-25T00:00:00.000Z"),
      createdBy: demoUser.id,
      projectId: demoProject.id,
    });

    await storage.createTask({
      title: "Hire DJ - Austin Groove Mobile",
      description: "Booked DJ for ceremony and reception music",
      status: "completed",
      category: "Music",
      priority: "medium",
      dueDate: new Date("2025-04-15T00:00:00.000Z"),
      completedAt: new Date("2025-04-10T00:00:00.000Z"),
      createdBy: demoUser.id,
      projectId: demoProject.id,
    });

    // In progress tasks
    await storage.createTask({
      title: "Order wedding invitations",
      description: "Design and order formal wedding invitations with RSVP cards",
      status: "pending",
      category: "Invitations",
      priority: "high",
      dueDate: new Date("2025-07-15T00:00:00.000Z"),
      createdBy: demoUser.id,
      projectId: demoProject.id,
    });

    await storage.createTask({
      title: "Wedding dress final fitting",
      description: "Schedule final dress fitting and alterations",
      status: "pending",
      category: "Attire",
      priority: "high",
      dueDate: new Date("2025-09-15T00:00:00.000Z"),
      createdBy: demoUser.id,
      projectId: demoProject.id,
    });

    await storage.createTask({
      title: "Order wedding cake",
      description: "Naked cake with fresh berries and rustic decorations",
      status: "pending",
      category: "Catering",
      priority: "medium",
      dueDate: new Date("2025-09-01T00:00:00.000Z"),
      createdBy: demoUser.id,
      projectId: demoProject.id,
    });
  }

  // Add comprehensive Austin guest list only if none exist
  if (existingGuests.length === 0) {
    // Wedding Party
    await storage.createGuest({
      name: "Sarah Martinez",
      email: "sarah.martinez@email.com",
      phone: "(512) 555-0101",
      group: "wedding-party",
      role: "Maid of Honor",
      rsvpStatus: "confirmed",
      dietaryRestrictions: "Vegetarian",
      plusOne: true,
      notes: "Emma's college roommate and best friend",
      addedBy: demoUser.id,
      projectId: demoProject.id,
    });

    await storage.createGuest({
      name: "Michael Thompson",
      email: "mike.thompson@email.com", 
      phone: "(512) 555-0102",
      group: "wedding-party",
      role: "Best Man",
      rsvpStatus: "confirmed",
      plusOne: true,
      notes: "Jake's brother and groomsman",
      addedBy: demoUser.id,
      projectId: demoProject.id,
    });

    // Family
    await storage.createGuest({
      name: "Robert & Linda Hayes",
      email: "linda.hayes@email.com",
      phone: "(512) 555-0201",
      group: "family",
      role: "Parents of Bride",
      rsvpStatus: "confirmed",
      notes: "Emma's parents - hosting rehearsal dinner",
      addedBy: demoUser.id,
      projectId: demoProject.id,
    });

    await storage.createGuest({
      name: "James & Patricia Thompson",
      email: "pat.thompson@email.com",
      phone: "(512) 555-0202",
      group: "family",
      role: "Parents of Groom", 
      rsvpStatus: "confirmed",
      notes: "Jake's parents",
      addedBy: demoUser.id,
      projectId: demoProject.id,
    });

    // Friends
    await storage.createGuest({
      name: "Amanda Foster",
      email: "amanda.foster@email.com",
      phone: "(512) 555-0401",
      group: "friends",
      rsvpStatus: "confirmed",
      dietaryRestrictions: "Vegan",
      plusOne: true,
      notes: "College sorority sister",
      addedBy: demoUser.id,
      projectId: demoProject.id,
    });

    await storage.createGuest({
      name: "Chris & Jennifer Lee",
      email: "chris.lee@email.com",
      phone: "(512) 555-0402",
      group: "friends", 
      rsvpStatus: "confirmed",
      notes: "College friends - married couple",
      addedBy: demoUser.id,
      projectId: demoProject.id,
    });

    // Out of town guests
    await storage.createGuest({
      name: "Alex & Sophia Turner",
      email: "alex.turner@email.com",
      phone: "(713) 555-0701",
      group: "friends",
      rsvpStatus: "confirmed",
      hotelInfo: "Staying at Hampton Inn Austin",
      notes: "Coming from Houston",
      addedBy: demoUser.id,
      projectId: demoProject.id,
    });
  }

  // Add Austin vendor list only if none exist
  if (existingVendors.length === 0) {
    await storage.createVendor({
      name: "Sunset Ranch Austin",
      category: "Venue",
      email: "events@sunsetranch.com",
      phone: "(512) 555-1000",
      status: "booked",
      quote: "8500",
      projectId: demoProject.id,
      addedBy: demoUser.id,
    });

    await storage.createVendor({
      name: "Sarah Chen Photography",
      category: "Photography",
      email: "sarah@sarahchenphotography.com",
      phone: "(512) 555-2000",
      status: "booked",
      quote: "3200",
      projectId: demoProject.id,
      addedBy: demoUser.id,
    });

    await storage.createVendor({
      name: "Hill Country Catering",
      category: "Catering",
      email: "info@hillcountrycatering.com",
      phone: "(512) 555-3000",
      status: "booked",
      quote: "4800",
      projectId: demoProject.id,
      addedBy: demoUser.id,
    });
  }

  // Add detailed budget items only if none exist  
  if (existingBudgetItems.length === 0) {
    await storage.createBudgetItem({
      category: "Venue",
      item: "Sunset Ranch venue rental",
      estimatedCost: "8500",
      actualCost: "8500",
      isPaid: true,
      createdBy: demoUser.id,
      projectId: demoProject.id,
    });

    await storage.createBudgetItem({
      category: "Photography",
      item: "Sarah Chen Photography package",
      estimatedCost: "3200",
      actualCost: "3200",
      isPaid: true,
      createdBy: demoUser.id,
      projectId: demoProject.id,
    });

    await storage.createBudgetItem({
      category: "Catering",
      item: "Hill Country BBQ dinner",
      estimatedCost: "4800",
      actualCost: "4800",
      isPaid: true,
      createdBy: demoUser.id,
      projectId: demoProject.id,
    });

    await storage.createBudgetItem({
      category: "Music",
      item: "Austin Groove DJ services",
      estimatedCost: "1200",
      actualCost: "1200",
      isPaid: true,
      createdBy: demoUser.id,
      projectId: demoProject.id,
    });

    await storage.createBudgetItem({
      category: "Attire",
      item: "Wedding dress",
      estimatedCost: "1200",
      actualCost: "1150",
      isPaid: true,
      createdBy: demoUser.id,
      projectId: demoProject.id,
    });

    await storage.createBudgetItem({
      category: "Flowers",
      item: "Bridal bouquet & centerpieces",
      estimatedCost: "2150",
      createdBy: demoUser.id,
      projectId: demoProject.id,
    });

    await storage.createBudgetItem({
      category: "Transportation",
      item: "Wedding party transportation",
      estimatedCost: "800",
      createdBy: demoUser.id,
      projectId: demoProject.id,
    });
  }

  console.log("Austin farmhouse wedding demo data created successfully!");
}