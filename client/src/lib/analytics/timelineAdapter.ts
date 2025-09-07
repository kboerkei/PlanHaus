export interface Task {
  id: number;
  title: string;
  status: 'open' | 'completed';
  dueDate?: string;
  createdAt: string;
}

export interface TimelineBurndownData {
  points: Array<{
    date: string;
    open: number;
    closed: number;
  }>;
  today?: string;
}

export function toBurndown(tasks: Task[], fromDate?: string, toDate?: string): TimelineBurndownData {
  const from = fromDate ? new Date(fromDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  const to = toDate ? new Date(toDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
  
  const dateMap = new Map<string, { open: number; closed: number }>();
  
  // Initialize all dates in range
  const currentDate = new Date(from);
  while (currentDate <= to) {
    const dateStr = currentDate.toISOString().split('T')[0];
    dateMap.set(dateStr, { open: 0, closed: 0 });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Process tasks
  tasks.forEach(task => {
    const taskDate = task.createdAt.split('T')[0];
    if (dateMap.has(taskDate)) {
      const current = dateMap.get(taskDate)!;
      if (task.status === 'completed') {
        current.closed++;
      } else {
        current.open++;
      }
    }
  });
  
  // Convert to array and sort by date
  const points = Array.from(dateMap.entries())
    .map(([date, counts]) => ({
      date,
      open: counts.open,
      closed: counts.closed
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  return {
    points,
    today: new Date().toISOString().split('T')[0]
  };
}

export function calculateTaskProgress(tasks: Task[]): {
  total: number;
  completed: number;
  percentage: number;
  overdue: number;
  dueSoon: number;
} {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  
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
  
  return {
    total,
    completed,
    percentage,
    overdue,
    dueSoon
  };
} 