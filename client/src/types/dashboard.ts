// Dashboard Types - Comprehensive type definitions for dashboard data
export interface TaskStats {
  completed: number;
  total: number;
  overdue?: number;
  inProgress?: number;
  notStarted?: number;
}

export interface BudgetStats {
  spent: number;
  total: number;
  remaining?: number;
  percentageUsed?: number;
}

export interface GuestStats {
  confirmed: number;
  total: number;
  pending?: number;
  declined?: number;
  responseRate?: number;
}

export interface VendorStats {
  booked: number;
  total: number;
  contacted?: number;
  quoted?: number;
  bookingRate?: number;
}

export interface DashboardStats {
  tasks: TaskStats;
  budget: BudgetStats;
  guests: GuestStats;
  vendors: VendorStats;
  daysUntilWedding?: number;
  projectId?: number;
  lastUpdated?: string;
  currentProject?: {
    id: number;
    name: string;
  };
}

export interface DashboardAction {
  type: 'task' | 'budget' | 'guest' | 'vendor';
  action: 'create' | 'update' | 'delete' | 'complete';
  entityId?: number;
  data?: Record<string, any>;
}

export interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  prefetchKey?: (string | number)[];
  badge?: string;
  urgent?: boolean;
}

export interface NavigationSection {
  title: string;
  description: string;
  items: NavigationItem[];
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  category: string;
  color: string;
  urgent: boolean;
  onClick: () => void;
}

export interface DashboardNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: Date;
  read: boolean;
} 