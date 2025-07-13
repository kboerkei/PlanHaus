import { storage } from "./storage";

export async function setupDemoData() {
  // Create demo user
  const demoUser = await storage.createUser({
    username: "Demo User",
    email: "demo@example.com",
    password: "demo123",
    avatar: null,
  });

  // Create a demo wedding project
  const demoProject = await storage.createWeddingProject({
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

  // Add some demo tasks
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

  // Add some demo guests
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

  // Add some demo vendors
  await storage.createVendor({
    name: "Bloom & Blossom Florists",
    category: "Florist",
    email: "info@bloomflorists.com",
    phone: "(555) 987-6543",
    status: "contacted",
    quote: "$2,500",
    projectId: demoProject.id,
    addedBy: demoUser.id,
  });

  // Add some demo budget items
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

  console.log("Demo data setup complete!");
  return { demoUser, demoProject };
}