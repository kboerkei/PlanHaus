import { Heart, Calendar, Gift, Users, Utensils, Building, CheckSquare, DollarSign, UserCheck, MapPin, Music, Camera, Cake, Baby, GraduationCap, Briefcase } from "lucide-react";

export const eventDashboardConfigs = {
  wedding: {
    title: "Wedding Planning Dashboard",
    welcomeMessage: "Welcome to your wedding planning workspace! Let's make your special day perfect.",
    primaryColor: "rose",
    icon: Heart,
    sections: [
      { id: 'timeline', name: 'Timeline', icon: CheckSquare, description: 'Wedding planning milestones and tasks' },
      { id: 'budget', name: 'Budget', icon: DollarSign, description: 'Track wedding expenses and allocations' },
      { id: 'guests', name: 'Guest List', icon: UserCheck, description: 'Manage RSVPs and guest information' },
      { id: 'vendors', name: 'Vendors', icon: MapPin, description: 'Find and book wedding vendors' },
      { id: 'inspiration', name: 'Inspiration', icon: Heart, description: 'Save ideas and mood boards' },
      { id: 'schedules', name: 'Wedding Day', icon: Calendar, description: 'Timeline for your wedding day' }
    ],
    quickActions: [
      { label: 'Book Venue', action: 'create-task', data: { title: 'Book Wedding Venue', category: 'venue' } },
      { label: 'Send Invitations', action: 'create-task', data: { title: 'Send Wedding Invitations', category: 'invitations' } },
      { label: 'Add Guest', action: 'navigate', data: { path: '/guests' } },
      { label: 'Update Budget', action: 'navigate', data: { path: '/budget' } }
    ],
    stats: ['tasks', 'budget', 'guests', 'vendors']
  },

  birthday: {
    title: "Birthday Party Dashboard",
    welcomeMessage: "Let's plan an amazing birthday celebration! Every detail matters for this special day.",
    primaryColor: "purple",
    icon: Calendar,
    sections: [
      { id: 'timeline', name: 'Party Tasks', icon: CheckSquare, description: 'Birthday party planning checklist' },
      { id: 'budget', name: 'Budget', icon: DollarSign, description: 'Track party expenses and costs' },
      { id: 'guests', name: 'Guest List', icon: UserCheck, description: 'Manage invitations and RSVPs' },
      { id: 'vendors', name: 'Services', icon: MapPin, description: 'Book entertainment and vendors' },
      { id: 'inspiration', name: 'Party Ideas', icon: Cake, description: 'Themes, decorations, and inspiration' },
      { id: 'schedules', name: 'Party Schedule', icon: Calendar, description: 'Timeline for the celebration' }
    ],
    quickActions: [
      { label: 'Book Venue', action: 'create-task', data: { title: 'Reserve Party Venue', category: 'venue' } },
      { label: 'Order Cake', action: 'create-task', data: { title: 'Order Birthday Cake', category: 'catering' } },
      { label: 'Send Invites', action: 'create-task', data: { title: 'Send Party Invitations', category: 'invitations' } },
      { label: 'Plan Activities', action: 'create-task', data: { title: 'Plan Party Games & Activities', category: 'entertainment' } }
    ],
    stats: ['tasks', 'budget', 'guests', 'vendors']
  },

  baby_shower: {
    title: "Baby Shower Dashboard",
    welcomeMessage: "Welcome to your baby shower planning space! Let's celebrate the upcoming arrival.",
    primaryColor: "blue",
    icon: Gift,
    sections: [
      { id: 'timeline', name: 'Shower Tasks', icon: CheckSquare, description: 'Baby shower planning checklist' },
      { id: 'budget', name: 'Budget', icon: DollarSign, description: 'Track shower expenses' },
      { id: 'guests', name: 'Guest List', icon: UserCheck, description: 'Manage invitations and RSVPs' },
      { id: 'vendors', name: 'Services', icon: MapPin, description: 'Catering and decoration services' },
      { id: 'inspiration', name: 'Shower Ideas', icon: Baby, description: 'Themes, games, and decoration ideas' },
      { id: 'schedules', name: 'Event Schedule', icon: Calendar, description: 'Timeline for the baby shower' }
    ],
    quickActions: [
      { label: 'Plan Games', action: 'create-task', data: { title: 'Plan Baby Shower Games', category: 'entertainment' } },
      { label: 'Order Decorations', action: 'create-task', data: { title: 'Order Baby Shower Decorations', category: 'decor' } },
      { label: 'Send Invites', action: 'create-task', data: { title: 'Send Shower Invitations', category: 'invitations' } },
      { label: 'Plan Menu', action: 'create-task', data: { title: 'Plan Shower Menu', category: 'catering' } }
    ],
    stats: ['tasks', 'budget', 'guests', 'vendors']
  },

  reunion: {
    title: "Reunion Planning Dashboard",
    welcomeMessage: "Let's bring everyone together! Plan a memorable reunion that celebrates your shared history.",
    primaryColor: "green",
    icon: Users,
    sections: [
      { id: 'timeline', name: 'Planning Tasks', icon: CheckSquare, description: 'Reunion planning checklist' },
      { id: 'budget', name: 'Budget', icon: DollarSign, description: 'Track reunion expenses and contributions' },
      { id: 'guests', name: 'Attendees', icon: UserCheck, description: 'Manage contact list and RSVPs' },
      { id: 'vendors', name: 'Services', icon: MapPin, description: 'Venue, catering, and entertainment' },
      { id: 'inspiration', name: 'Memory Lane', icon: GraduationCap, description: 'Photos, memories, and activities' },
      { id: 'schedules', name: 'Event Schedule', icon: Calendar, description: 'Reunion day timeline and activities' }
    ],
    quickActions: [
      { label: 'Find Contacts', action: 'create-task', data: { title: 'Locate Missing Classmates/Family', category: 'planning' } },
      { label: 'Book Venue', action: 'create-task', data: { title: 'Reserve Reunion Venue', category: 'venue' } },
      { label: 'Collect Photos', action: 'create-task', data: { title: 'Gather Old Photos & Memories', category: 'memories' } },
      { label: 'Plan Activities', action: 'create-task', data: { title: 'Plan Reunion Activities', category: 'entertainment' } }
    ],
    stats: ['tasks', 'budget', 'guests', 'vendors']
  },

  dinner_party: {
    title: "Dinner Party Dashboard",
    welcomeMessage: "Create an elegant dining experience! Every detail from menu to ambiance matters.",
    primaryColor: "orange",
    icon: Utensils,
    sections: [
      { id: 'timeline', name: 'Prep Tasks', icon: CheckSquare, description: 'Dinner party preparation checklist' },
      { id: 'budget', name: 'Budget', icon: DollarSign, description: 'Track food, wine, and decor costs' },
      { id: 'guests', name: 'Guest List', icon: UserCheck, description: 'Manage invitations and dietary needs' },
      { id: 'vendors', name: 'Suppliers', icon: MapPin, description: 'Catering, wine, and specialty items' },
      { id: 'inspiration', name: 'Menu & Decor', icon: Utensils, description: 'Menu ideas, table settings, and ambiance' },
      { id: 'schedules', name: 'Evening Timeline', icon: Calendar, description: 'Cooking and serving schedule' }
    ],
    quickActions: [
      { label: 'Plan Menu', action: 'create-task', data: { title: 'Finalize Dinner Menu', category: 'menu' } },
      { label: 'Wine Pairing', action: 'create-task', data: { title: 'Select Wine Pairings', category: 'beverages' } },
      { label: 'Table Setting', action: 'create-task', data: { title: 'Plan Table Setting & Decor', category: 'decor' } },
      { label: 'Shopping List', action: 'create-task', data: { title: 'Create Shopping List', category: 'shopping' } }
    ],
    stats: ['tasks', 'budget', 'guests', 'vendors']
  },

  corporate: {
    title: "Corporate Event Dashboard",
    welcomeMessage: "Professional event planning made simple. Let's create a successful corporate experience.",
    primaryColor: "slate",
    icon: Building,
    sections: [
      { id: 'timeline', name: 'Project Tasks', icon: CheckSquare, description: 'Event planning timeline and milestones' },
      { id: 'budget', name: 'Budget', icon: DollarSign, description: 'Track event budget and approvals' },
      { id: 'guests', name: 'Attendees', icon: UserCheck, description: 'Manage invitations and registrations' },
      { id: 'vendors', name: 'Vendors', icon: MapPin, description: 'Venue, catering, and AV services' },
      { id: 'inspiration', name: 'Event Design', icon: Briefcase, description: 'Branding, layout, and presentation ideas' },
      { id: 'schedules', name: 'Event Schedule', icon: Calendar, description: 'Detailed event timeline and logistics' }
    ],
    quickActions: [
      { label: 'Book Venue', action: 'create-task', data: { title: 'Secure Event Venue', category: 'venue' } },
      { label: 'AV Setup', action: 'create-task', data: { title: 'Arrange AV Equipment', category: 'technology' } },
      { label: 'Catering', action: 'create-task', data: { title: 'Book Corporate Catering', category: 'catering' } },
      { label: 'Send Invites', action: 'create-task', data: { title: 'Send Event Invitations', category: 'invitations' } }
    ],
    stats: ['tasks', 'budget', 'guests', 'vendors']
  }
};

export const getEventConfig = (eventType) => {
  return eventDashboardConfigs[eventType] || eventDashboardConfigs.wedding;
};

export const getEventDisplayName = (eventType) => {
  const names = {
    wedding: 'Wedding',
    birthday: 'Birthday Party',
    baby_shower: 'Baby Shower',
    reunion: 'Reunion',
    dinner_party: 'Dinner Party',
    corporate: 'Corporate Event'
  };
  return names[eventType] || 'Event';
};