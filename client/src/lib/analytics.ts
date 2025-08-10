// Define the gtag function globally
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    plausible?: (event: string, options?: { props?: Record<string, any> }) => void;
  }
}

// Analytics configuration
const ANALYTICS_CONFIG = {
  GA_MEASUREMENT_ID: import.meta.env.VITE_GA_MEASUREMENT_ID,
  PLAUSIBLE_DOMAIN: import.meta.env.VITE_PLAUSIBLE_DOMAIN || window.location.hostname,
  PLAUSIBLE_SRC: import.meta.env.VITE_PLAUSIBLE_SRC || "https://plausible.io/js/script.js",
} as const;

// Initialize Google Analytics 4
export const initGA4 = (): void => {
  const measurementId = ANALYTICS_CONFIG.GA_MEASUREMENT_ID;

  if (!measurementId) {
    console.warn("GA4 Measurement ID not found. Add VITE_GA_MEASUREMENT_ID to your environment variables.");
    return;
  }

  // Add Google Analytics script
  const script1 = document.createElement("script");
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // Initialize gtag
  const script2 = document.createElement("script");
  script2.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}', {
      page_title: document.title,
      page_location: window.location.href,
      send_page_view: true
    });
  `;
  document.head.appendChild(script2);
};

// Initialize Plausible Analytics
export const initPlausible = (): void => {
  const domain = ANALYTICS_CONFIG.PLAUSIBLE_DOMAIN;
  const src = ANALYTICS_CONFIG.PLAUSIBLE_SRC;

  if (!domain) {
    console.warn("Plausible domain not configured. Add VITE_PLAUSIBLE_DOMAIN to your environment variables.");
    return;
  }

  const script = document.createElement("script");
  script.defer = true;
  script.src = src;
  script.setAttribute("data-domain", domain);
  document.head.appendChild(script);
};

// Initialize analytics (both GA4 and Plausible)
export const initAnalytics = (): void => {
  // Only initialize in production or when explicitly enabled
  if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_ANALYTICS === "true") {
    if (ANALYTICS_CONFIG.GA_MEASUREMENT_ID) {
      initGA4();
    }
    
    if (ANALYTICS_CONFIG.PLAUSIBLE_DOMAIN) {
      initPlausible();
    }
  } else {
    console.info("Analytics disabled in development mode");
  }
};

// Track page views for SPAs
export const trackPageView = (url: string, title?: string): void => {
  // GA4 tracking
  if (typeof window !== "undefined" && window.gtag) {
    const measurementId = ANALYTICS_CONFIG.GA_MEASUREMENT_ID;
    if (measurementId) {
      window.gtag("config", measurementId, {
        page_path: url,
        page_title: title || document.title,
        page_location: window.location.origin + url,
      });
    }
  }

  // Plausible tracking (automatic for SPAs, but manual trigger for custom events)
  if (typeof window !== "undefined" && window.plausible) {
    window.plausible("pageview");
  }
};

// Track custom events
export const trackEvent = (
  eventName: string,
  properties?: {
    category?: string;
    label?: string;
    value?: number;
    [key: string]: any;
  }
): void => {
  // GA4 event tracking
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, {
      event_category: properties?.category,
      event_label: properties?.label,
      value: properties?.value,
      ...properties,
    });
  }

  // Plausible event tracking
  if (typeof window !== "undefined" && window.plausible) {
    window.plausible(eventName, {
      props: properties,
    });
  }
};

// Wedding app specific events
export const trackWeddingEvent = {
  // Project management
  createProject: (projectType: string) => 
    trackEvent("create_project", { category: "project", label: projectType }),
  
  editProject: (projectId: string) => 
    trackEvent("edit_project", { category: "project", project_id: projectId }),
  
  deleteProject: (projectId: string) => 
    trackEvent("delete_project", { category: "project", project_id: projectId }),

  // Guest management
  addGuest: (guestCount: number) => 
    trackEvent("add_guest", { category: "guests", value: guestCount }),
  
  editGuest: () => 
    trackEvent("edit_guest", { category: "guests" }),
  
  deleteGuest: () => 
    trackEvent("delete_guest", { category: "guests" }),
  
  importGuests: (count: number) => 
    trackEvent("import_guests", { category: "guests", value: count }),

  // Budget management
  addExpense: (amount: number, category: string) => 
    trackEvent("add_expense", { category: "budget", label: category, value: amount }),
  
  editExpense: (category: string) => 
    trackEvent("edit_expense", { category: "budget", label: category }),
  
  deleteExpense: (category: string) => 
    trackEvent("delete_expense", { category: "budget", label: category }),

  // Task management
  createTask: (category: string, priority: string) => 
    trackEvent("create_task", { category: "tasks", label: category, priority }),
  
  completeTask: (category: string) => 
    trackEvent("complete_task", { category: "tasks", label: category }),
  
  editTask: (category: string) => 
    trackEvent("edit_task", { category: "tasks", label: category }),
  
  deleteTask: (category: string) => 
    trackEvent("delete_task", { category: "tasks", label: category }),

  // Vendor management
  addVendor: (category: string) => 
    trackEvent("add_vendor", { category: "vendors", label: category }),
  
  contactVendor: (category: string) => 
    trackEvent("contact_vendor", { category: "vendors", label: category }),
  
  bookVendor: (category: string, amount?: number) => 
    trackEvent("book_vendor", { category: "vendors", label: category, value: amount }),

  // AI features
  useAIRecommendation: (feature: string) => 
    trackEvent("ai_recommendation", { category: "ai", label: feature }),
  
  useAIChat: () => 
    trackEvent("ai_chat", { category: "ai" }),
  
  generateTimeline: () => 
    trackEvent("generate_timeline", { category: "ai" }),

  // Collaboration
  inviteCollaborator: (role: string) => 
    trackEvent("invite_collaborator", { category: "collaboration", label: role }),
  
  acceptInvite: () => 
    trackEvent("accept_collaboration_invite", { category: "collaboration" }),
  
  shareProject: (method: string) => 
    trackEvent("share_project", { category: "collaboration", label: method }),

  // Export/Import
  exportData: (format: string) => 
    trackEvent("export_data", { category: "data", label: format }),
  
  importData: (source: string) => 
    trackEvent("import_data", { category: "data", label: source }),

  // Engagement
  viewDashboard: () => 
    trackEvent("view_dashboard", { category: "engagement" }),
  
  useFeature: (feature: string) => 
    trackEvent("use_feature", { category: "engagement", label: feature }),
  
  completeOnboarding: () => 
    trackEvent("complete_onboarding", { category: "engagement" }),
};