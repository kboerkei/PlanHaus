import { storage } from './storage.js';

// Test script to create some sample activity log entries
async function createSampleActivities() {
  console.log('Creating sample activity log entries...');

  try {
    // Sample activities for the demo wedding project
    const activities = [
      {
        projectId: 1,
        userId: 1,
        userName: 'Demo User',
        section: 'Creative Details',
        action: 'Created',
        entityType: 'signature_drinks',
        entityId: 1,
        details: 'added "Austin Mule" to signature drinks (vodka, ginger beer, lime, mint)'
      },
      {
        projectId: 1,
        userId: 1,
        userName: 'Demo User',
        section: 'Budget',
        action: 'Updated',
        entityType: 'budget_item',
        entityId: 1,
        details: 'updated venue cost in Venue category - $8,500 (increased from estimate)'
      },
      {
        projectId: 1,
        userId: 1,
        userName: 'Demo User',
        section: 'Guest List',
        action: 'Created',
        entityType: 'guest',
        entityId: 1,
        details: 'added Sarah Thompson to guest list (family, party of 2)'
      },
      {
        projectId: 1,
        userId: 1,
        userName: 'Demo User',
        section: 'Timeline',
        action: 'Completed',
        entityType: 'task',
        entityId: 1,
        details: 'completed "Book wedding venue" task - Sunset Ranch Austin confirmed!'
      },
      {
        projectId: 1,
        userId: 1,
        userName: 'Demo User',
        section: 'Vendors',
        action: 'Created',
        entityType: 'vendor',
        entityId: 1,
        details: 'added Austin Wedding Photography to photographer vendors (quote: $3,200)'
      }
    ];

    for (const activity of activities) {
      await storage.createActivityLogEntry(activity);
      console.log(`✓ Created activity: ${activity.details}`);
    }

    console.log('✓ Sample activity log entries created successfully!');
  } catch (error) {
    console.error('Error creating sample activities:', error);
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createSampleActivities();
}