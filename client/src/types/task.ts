export interface Task {
  id: number;
  projectId: number;
  title: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  completedDate?: string;
  assignedTo?: number;
  category?: string;
  tags?: string[];
  dependencies?: number[];
  estimatedHours?: number;
  actualHours?: number;
  attachments?: string[];
  notes?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCategory {
  category: string;
  tasks: Task[];
  completedCount: number;
  totalCount: number;
}

export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  overdue: number;
  completionRate: number;
}

export type TaskInsert = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;
export type TaskUpdate = Partial<Omit<Task, 'id' | 'projectId' | 'createdBy' | 'createdAt' | 'updatedAt'>>;