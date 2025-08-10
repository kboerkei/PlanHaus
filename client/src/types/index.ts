// Shared types for client-side type safety

// API Response Types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Drag and Drop Types
export interface DragItem {
  id: string;
  type: 'task' | 'guest' | 'vendor' | 'timeline-item';
  data: Record<string, unknown>;
}

export interface DragResult {
  source: {
    index: number;
    droppableId: string;
  };
  destination: {
    index: number;
    droppableId: string;
  } | null;
  draggableId: string;
  type: string;
}

export interface DropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  accept?: Record<string, string[]>;
  multiple?: boolean;
  maxSize?: number;
  disabled?: boolean;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error?: ApiError | null;
}

export interface FormState extends LoadingState {
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
}

// Chart and Analytics Types
export interface ChartDataPoint {
  name: string;
  value: number;
  label?: string;
  color?: string;
}

export interface BudgetChartData {
  category: string;
  estimated: number;
  actual: number;
  percentage?: number;
  color?: string;
}

export interface BudgetItem {
  id: number | string;
  projectId?: number;
  category: string;
  item: string;
  estimatedCost: number;
  actualCost: number;
  vendor?: string;
  isPaid?: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MoodBoardItem {
  id: string;
  title?: string;
  imageUrl?: string;
  category?: string;
  notes?: string;
  colors?: string[];
  tags?: string[];
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface DashboardStats {
  tasks: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  };
  guests: {
    total: number;
    confirmed: number;
    declined: number;
    pending: number;
  };
  budget: {
    totalBudget: number;
    totalSpent: number;
    remaining: number;
    percentage: number;
  };
  vendors: {
    total: number;
    booked: number;
    pending: number;
  };
}

export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'number' | 'date' | 'badge' | 'action';
  render?: (value: unknown, item: T) => React.ReactNode;
  className?: string;
  mobileHidden?: boolean;
}

export interface TableProps<T = Record<string, unknown>> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  sortKey?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string, order: 'asc' | 'desc') => void;
  className?: string;
}

export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  page?: string;
}

// Navigation Types
export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  current?: boolean;
}

// Performance Monitoring
export interface PerformanceMetric {
  component: string;
  renderCount: number;
  timeSinceMount: string;
}

// Generic utility types
export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type ID = string | number;