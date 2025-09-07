export interface Task {
  id: number;
  title: string;
  status: 'open' | 'completed';
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface TaskStatusData {
  segments: Array<{
    label: string;
    value: number;
    color: string;
  }>;
}

export function toStatus(tasks: Task[]): TaskStatusData {
  const now = new Date();
  
  const overdue = tasks.filter(t => 
    t.status === 'open' && 
    t.dueDate && 
    new Date(t.dueDate) < now
  ).length;
  
  const dueSoon = tasks.filter(t => {
    if (t.status === 'open' && t.dueDate) {
      const dueDate = new Date(t.dueDate);
      const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    }
    return false;
  }).length;
  
  const onTrack = tasks.filter(t => {
    if (t.status === 'open' && t.dueDate) {
      const dueDate = new Date(t.dueDate);
      const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays > 7;
    }
    return t.status === 'open' && !t.dueDate;
  }).length;
  
  return {
    segments: [
      {
        label: 'Overdue',
        value: overdue,
        color: '#EF4444' // red-500
      },
      {
        label: 'Due Soon',
        value: dueSoon,
        color: '#F59E0B' // amber-500
      },
      {
        label: 'On Track',
        value: onTrack,
        color: '#10B981' // emerald-500
      }
    ]
  };
}

export function getTaskPriorityBreakdown(tasks: Task[]): {
  high: number;
  medium: number;
  low: number;
  unassigned: number;
} {
  const high = tasks.filter(t => t.priority === 'high' && t.status === 'open').length;
  const medium = tasks.filter(t => t.priority === 'medium' && t.status === 'open').length;
  const low = tasks.filter(t => t.priority === 'low' && t.status === 'open').length;
  const unassigned = tasks.filter(t => !t.priority && t.status === 'open').length;
  
  return { high, medium, low, unassigned };
}

export function getTasksDueThisWeek(tasks: Task[]): Task[] {
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  return tasks.filter(t => {
    if (t.status === 'open' && t.dueDate) {
      const dueDate = new Date(t.dueDate);
      return dueDate >= now && dueDate <= weekFromNow;
    }
    return false;
  });
} 