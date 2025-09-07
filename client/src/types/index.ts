// Unified Types Index - Export all type definitions
export * from './dashboard';
export * from './entities';

// Re-export commonly used types for convenience
export type {
  User,
  WeddingProject,
  Task,
  BudgetItem,
  Guest,
  Vendor,
  Activity,
  UserSession,
  Collaborator,
  InsertUser,
  InsertWeddingProject,
  InsertTask,
  InsertBudgetItem,
  InsertGuest,
  InsertVendor,
  InsertActivity,
  InsertUserSession,
  InsertCollaborator,
} from './entities';

export type {
  DashboardStats,
  TaskStats,
  BudgetStats,
  GuestStats,
  VendorStats,
  DashboardAction,
  NavigationItem,
  NavigationSection,
  QuickAction,
  DashboardNotification,
} from './dashboard';

// API Types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Additional types for components
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, item: any) => React.ReactNode;
}

export interface TableProps {
  data: any[];
  columns: TableColumn[];
  onRowClick?: (item: any) => void;
  onSelectionChange?: (selectedItems: any[]) => void;
  selectable?: boolean;
  sortable?: boolean;
  pagination?: boolean;
  searchable?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
  current?: boolean;
}

export interface MoodBoardItem {
  id: number;
  title: string;
  imageUrl?: string;
  category?: string;
  notes?: string;
  colors?: string[];
  tags?: string[];
  position: { x: number; y: number };
  size: { width: number; height: number };
  createdAt: string;
  updatedAt: string;
}