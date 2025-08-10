export interface TimelineEvent {
  id: number;
  projectId: number;
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  location?: string;
  type: 'wedding_day' | 'rehearsal' | 'welcome_party' | 'brunch' | 'appointment' | 'deadline' | 'custom';
  status: 'planned' | 'confirmed' | 'completed' | 'cancelled';
  attendees?: string[];
  vendorId?: number;
  taskId?: number;
  notes?: string;
  isAllDay: boolean;
  color?: string;
  priority: 'low' | 'medium' | 'high';
  reminders?: string[];
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineDay {
  date: string;
  events: TimelineEvent[];
  dayType: 'wedding_day' | 'rehearsal' | 'regular';
}

export interface TimelineWeek {
  weekStart: string;
  weekEnd: string;
  days: TimelineDay[];
}

export interface TimelineMonth {
  month: string;
  year: number;
  weeks: TimelineWeek[];
}

// Drag and drop types for timeline
export interface DragEventData {
  eventId: number;
  originalDate: string;
  originalTime?: string;
}

export interface DropResult {
  newDate: string;
  newTime?: string;
}

export interface DragOverEvent extends React.DragEvent<HTMLElement> {
  currentTarget: HTMLElement & {
    dataset: {
      date?: string;
      time?: string;
    };
  };
}

export interface DragStartEvent extends React.DragEvent<HTMLElement> {
  currentTarget: HTMLElement & {
    dataset: {
      eventId?: string;
      date?: string;
      time?: string;
    };
  };
}

export type TimelineEventInsert = Omit<TimelineEvent, 'id' | 'createdAt' | 'updatedAt'>;
export type TimelineEventUpdate = Partial<Omit<TimelineEvent, 'id' | 'projectId' | 'createdBy' | 'createdAt' | 'updatedAt'>>;