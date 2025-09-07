import { IntakeData } from '../../schemas/intake';

// Project metadata mapping
export const toProjectMeta = (intake: IntakeData) => {
  const step1 = intake.step1;
  const step2 = intake.step2;
  
  return {
    title: step2?.workingTitle || `${step1?.couple?.firstName?.[0]} & ${step1?.couple?.firstName?.[1]}'s Wedding`,
    date: step2?.date ? new Date(step2.date) : new Date(),
    city: step2?.location?.city || '',
    country: step2?.location?.country || '',
    guestCount: step2?.guests?.estimatedGuestCount || 0,
    styleVibes: step2?.style?.styleVibes || [],
    colorPalette: step2?.style?.colorPalette || [],
    priorities: step2?.style?.priorities || [],
    venue: step2?.venues?.ceremonyVenueName || '',
    description: `Wedding for ${step1?.couple?.firstName?.[0]} and ${step1?.couple?.firstName?.[1]}`,
  };
};

// Budget plan mapping
export const toBudgetPlan = (intake: IntakeData) => {
  const step3 = intake.step3;
  
  if (!step3) return null;
  
  return {
    currency: step3.currency || 'USD',
    total: step3.totalBudget || 0,
    categories: step3.categories?.map(cat => ({
      name: cat.name,
      percent: cat.percent,
      hardCap: cat.hardCap,
      estimatedCost: cat.hardCap || ((cat.percent / 100) * (step3.totalBudget || 0)),
    })) || [],
    mustHaves: step3.mustHaves || [],
    niceToHaves: step3.niceToHaves || [],
  };
};

// Timeline seed tasks mapping
export const toTimelineSeed = (intake: IntakeData) => {
  const step2 = intake.step2;
  const step4 = intake.step4;
  const step5 = intake.step5;
  
  if (!step2?.date) return [];
  
  const weddingDate = new Date(step2.date);
  const tasks = [];
  
  // Helper function to calculate task dates relative to wedding date
  const getTaskDate = (monthsBefore: number) => {
    const date = new Date(weddingDate);
    date.setMonth(date.getMonth() - monthsBefore);
    return date;
  };
  
  // Core planning tasks
  tasks.push({
    title: "Set overall wedding budget",
    description: "Determine total budget and allocate to categories",
    category: "planning",
    priority: "high",
    dueDate: getTaskDate(12),
    status: "not_started",
  });
  
  tasks.push({
    title: "Book ceremony and reception venues",
    description: "Secure primary venues for the wedding",
    category: "venue",
    priority: "high",
    dueDate: getTaskDate(12),
    status: "not_started",
  });
  
  tasks.push({
    title: "Hire wedding planner (if desired)",
    description: "Interview and book wedding planner",
    category: "planning",
    priority: "medium",
    dueDate: getTaskDate(11),
    status: "not_started",
  });
  
  // Vendor booking tasks
  if (step5?.requiredVendors?.includes('photographer')) {
    tasks.push({
      title: "Book photographer",
      description: "Research and book wedding photographer",
      category: "photography",
      priority: "high",
      dueDate: getTaskDate(10),
      status: "not_started",
    });
  }
  
  if (step5?.requiredVendors?.includes('caterer')) {
    tasks.push({
      title: "Book caterer",
      description: "Secure catering services for reception",
      category: "catering",
      priority: "high",
      dueDate: getTaskDate(9),
      status: "not_started",
    });
  }
  
  if (step5?.requiredVendors?.includes('florist')) {
    tasks.push({
      title: "Book florist",
      description: "Secure floral arrangements and decor",
      category: "flowers",
      priority: "medium",
      dueDate: getTaskDate(8),
      status: "not_started",
    });
  }
  
  if (step5?.requiredVendors?.includes('musician')) {
    tasks.push({
      title: "Book music/entertainment",
      description: "Secure ceremony and reception music",
      category: "music",
      priority: "medium",
      dueDate: getTaskDate(8),
      status: "not_started",
    });
  }
  
  if (step5?.requiredVendors?.includes('officiant')) {
    tasks.push({
      title: "Book officiant",
      description: "Secure wedding officiant",
      category: "other",
      priority: "medium",
      dueDate: getTaskDate(7),
      status: "not_started",
    });
  }
  
  // Attire and beauty
  if (step5?.requiredVendors?.includes('attire')) {
    tasks.push({
      title: "Order wedding attire",
      description: "Purchase wedding dress and groom's attire",
      category: "attire",
      priority: "medium",
      dueDate: getTaskDate(6),
      status: "not_started",
    });
  }
  
  if (step5?.requiredVendors?.includes('beauty')) {
    tasks.push({
      title: "Book beauty services",
      description: "Secure hair and makeup services",
      category: "other",
      priority: "medium",
      dueDate: getTaskDate(4),
      status: "not_started",
    });
  }
  
  // Stationery and invitations
  if (step5?.requiredVendors?.includes('stationery')) {
    tasks.push({
      title: "Order invitations",
      description: "Design and order wedding invitations",
      category: "invitations",
      priority: "medium",
      dueDate: getTaskDate(6),
      status: "not_started",
    });
    
    tasks.push({
      title: "Send invitations",
      description: "Mail wedding invitations to guests",
      category: "invitations",
      priority: "high",
      dueDate: getTaskDate(4),
      status: "not_started",
    });
  }
  
  // RSVP and guest management
  tasks.push({
    title: "Track RSVPs",
    description: "Monitor and follow up on guest RSVPs",
    category: "planning",
    priority: "medium",
    dueDate: getTaskDate(2),
    status: "not_started",
  });
  
  tasks.push({
    title: "Create seating chart",
    description: "Design seating arrangements for reception",
    category: "planning",
    priority: "medium",
    dueDate: getTaskDate(1),
    status: "not_started",
  });
  
  // Final preparations
  tasks.push({
    title: "Wedding rehearsal",
    description: "Conduct wedding ceremony rehearsal",
    category: "planning",
    priority: "high",
    dueDate: getTaskDate(0.1), // 1 day before
    status: "not_started",
  });
  
  tasks.push({
    title: "Final vendor meetings",
    description: "Meet with all vendors to confirm details",
    category: "planning",
    priority: "high",
    dueDate: getTaskDate(0.5), // 2 weeks before
    status: "not_started",
  });
  
  return tasks;
};

// Vendor filters mapping
export const toVendorFilters = (intake: IntakeData) => {
  const step2 = intake.step2;
  const step3 = intake.step3;
  const step5 = intake.step5;
  const step6 = intake.step6;
  
  return {
    radiusMiles: step5?.search?.radiusMiles || 50,
    location: {
      city: step2?.location?.city || '',
      state: step2?.location?.state || '',
      country: step2?.location?.country || '',
      zip: step5?.search?.preferredZip || '',
    },
    styles: step2?.style?.styleVibes || [],
    priceBands: step5?.budgetBands || {},
    availabilityWindow: step5?.search?.availabilityWindow,
    mustHaves: step3?.mustHaves || [],
    niceToHaves: step3?.niceToHaves || [],
    requiredVendors: step5?.requiredVendors || [],
    photographerStyle: step5?.photographer?.style,
    musicPreference: step5?.music?.bandOrDJ,
    floralStyle: step5?.florals?.style,
  };
};

// Site content preferences mapping
export const toSiteContentPrefs = (intake: IntakeData) => {
  const step1 = intake.step1;
  const step6 = intake.step6;
  
  return {
    tone: step6?.website?.copyTone || 'friendly',
    bilingual: step6?.website?.bilingualSite || false,
    rsvpPreference: step6?.guests?.rsvpPreference || 'site',
    preferredLanguage: step1?.preferredLanguage || 'en',
    coupleNames: {
      partner1: `${step1?.couple?.firstName?.[0]} ${step1?.couple?.lastName?.[0]}`,
      partner2: `${step1?.couple?.firstName?.[1]} ${step1?.couple?.lastName?.[1]}`,
    },
  };
};

// Guest management preferences
export const toGuestPrefs = (intake: IntakeData) => {
  const step2 = intake.step2;
  const step6 = intake.step6;
  
  return {
    estimatedCount: step2?.guests?.estimatedGuestCount || 0,
    adultsOnly: step2?.guests?.adultsOnly || false,
    minorsCount: step2?.guests?.minorsCount || 0,
    kidsPolicy: step6?.guests?.kidsPolicy || 'all',
    rsvpPreference: step6?.guests?.rsvpPreference || 'site',
    majorityOutOfTown: step6?.travel?.majorityFromOutOfTown || false,
    hotelBlocksNeeded: step6?.travel?.hotelBlocksNeeded || 0,
    shuttleNeeded: step6?.travel?.shuttleNeeded || false,
  };
};

// Ceremony and reception details
export const toEventDetails = (intake: IntakeData) => {
  const step2 = intake.step2;
  const step4 = intake.step4;
  
  return {
    ceremony: {
      type: step4?.ceremony?.type || 'civil',
      venue: step2?.venues?.ceremonyVenueName || '',
      officiantNeeded: step4?.ceremony?.officiantNeeded || false,
      officiantNotes: step4?.ceremony?.officiantNotes || '',
    },
    reception: {
      venue: step2?.venues?.receptionVenueName || step2?.venues?.ceremonyVenueName || '',
      sameVenue: step2?.venues?.bothSameVenue || false,
      mealStyle: step4?.dining?.mealStyle || 'plated',
      barPreference: step4?.dining?.barPreference || 'open',
      seatingStyle: step4?.seating?.style || 'rounds',
      danceFloorRequired: step4?.seating?.danceFloorRequired || true,
      stageRequired: step4?.seating?.stageRequired || false,
    },
    specialMoments: step4?.specialMoments || [],
    timeline: {
      preferences: step4?.timeline?.preferences || '',
      sunsetCeremony: step4?.timeline?.sunsetCeremony || false,
    },
  };
};

// Main orchestrator function
export const applyIntakeToProject = async (projectId: number, intake: IntakeData) => {
  try {
    // Extract all the mapped data
    const projectMeta = toProjectMeta(intake);
    const budgetPlan = toBudgetPlan(intake);
    const timelineTasks = toTimelineSeed(intake);
    const vendorFilters = toVendorFilters(intake);
    const sitePrefs = toSiteContentPrefs(intake);
    const guestPrefs = toGuestPrefs(intake);
    const eventDetails = toEventDetails(intake);
    
    // TODO: Implement the actual database operations
    // This would involve:
    // 1. Updating the project with projectMeta
    // 2. Creating/updating budget items with budgetPlan
    // 3. Creating timeline tasks with timelineTasks
    // 4. Setting vendor preferences with vendorFilters
    // 5. Storing site preferences with sitePrefs
    // 6. Setting guest management preferences with guestPrefs
    // 7. Storing event details with eventDetails
    
    console.log('Intake data mapped successfully:', {
      projectId,
      projectMeta,
      budgetPlan,
      timelineTasks: timelineTasks.length,
      vendorFilters,
      sitePrefs,
      guestPrefs,
      eventDetails,
    });
    
    return {
      success: true,
      projectId,
      mappings: {
        projectMeta,
        budgetPlan,
        timelineTasks,
        vendorFilters,
        sitePrefs,
        guestPrefs,
        eventDetails,
      },
    };
  } catch (error) {
    console.error('Error applying intake to project:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Utility function to check if intake is complete
export const isIntakeComplete = (intake: IntakeData) => {
  return !!(
    intake.step1?.couple?.firstName?.[0] &&
    intake.step1?.couple?.firstName?.[1] &&
    intake.step2?.workingTitle &&
    intake.step2?.date &&
    intake.step2?.location?.city &&
    intake.step3?.totalBudget &&
    intake.step7?.consent
  );
};

// Utility function to get completion percentage
export const getIntakeCompletion = (intake: IntakeData) => {
  const steps = [
    intake.step1,
    intake.step2,
    intake.step3,
    intake.step4,
    intake.step5,
    intake.step6,
    intake.step7,
  ];
  
  const completedSteps = steps.filter(step => {
    if (!step) return false;
    return Object.keys(step).length > 0 && Object.values(step).some(val => val !== undefined && val !== null && val !== '');
  });
  
  return Math.round((completedSteps.length / steps.length) * 100);
}; 