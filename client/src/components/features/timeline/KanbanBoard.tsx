import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  UniqueIdentifier,
  MeasuringStrategy,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarDays, Clock, Users, AlertTriangle, CheckCircle2, Star, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import type { Task } from '@/types';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdate: (taskId: number, updates: Partial<Task>) => void;
  onTaskReorder: (tasks: Task[]) => void;
  projectId: number;
}

interface KanbanTaskProps {
  task: Task;
  onToggle: (taskId: number, completed: boolean) => void;
}

type TaskStatus = 'not_started' | 'in_progress' | 'completed';

interface Column {
  id: TaskStatus;
  title: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const columns: Column[] = [
  {
    id: 'not_started',
    title: 'To Do',
    color: 'bg-gray-100 border-gray-300',
    icon: Clock,
    description: 'Tasks waiting to be started'
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    color: 'bg-blue-100 border-blue-300',
    icon: Star,
    description: 'Currently working on these tasks'
  },
  {
    id: 'completed',
    title: 'Done',
    color: 'bg-green-100 border-green-300',
    icon: CheckCircle2,
    description: 'Completed tasks'
  }
];

function KanbanTask({ task, onToggle }: KanbanTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
  const isDueSoon = task.dueDate && new Date(task.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && !task.completed;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`mb-3 cursor-move transition-all duration-200 ${
        isDragging ? 'shadow-lg scale-105 rotate-2' : 'shadow-sm hover:shadow-md'
      } ${isOverdue ? 'border-red-300 bg-red-50' : ''} ${
        isDueSoon ? 'border-yellow-300 bg-yellow-50' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h4 className={`font-medium text-sm mb-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </h4>
            {task.description && (
              <p className="text-xs text-gray-600 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-1 ml-2">
            {isOverdue && (
              <AlertTriangle className="h-3 w-3 text-red-500" />
            )}
            {task.priority === 'high' && (
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          <Badge variant="outline" className={`${getPriorityColor(task.priority)} text-xs`}>
            {task.priority}
          </Badge>
          
          {task.category && (
            <Badge variant="secondary" className="text-xs">
              {task.category}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            {task.dueDate && (
              <div className="flex items-center space-x-1">
                <CalendarDays className="w-3 h-3" />
                <span className={isOverdue ? 'text-red-600 font-medium' : isDueSoon ? 'text-yellow-600' : ''}>
                  {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                </span>
              </div>
            )}
          </div>
          
          {task.assignedTo && (
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span className="truncate max-w-16">{task.assignedTo}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function KanbanColumn({ column, tasks, onTaskUpdate }: { 
  column: Column, 
  tasks: Task[], 
  onTaskUpdate: (taskId: number, updates: Partial<Task>) => void 
}) {
  const Icon = column.icon;
  
  return (
    <Card className={`${column.color} min-h-[500px]`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5" />
            <span className="text-lg">{column.title}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {tasks.length}
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">{column.description}</p>
      </CardHeader>
      
      <CardContent className="pt-0">
        <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <KanbanTask 
              key={task.id} 
              task={task} 
                              onToggle={(taskId, completed) => {
                onTaskUpdate(taskId, { 
                  isCompleted: completed, 
                  status: completed ? 'completed' : 'not_started' 
                });
              })}
            />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tasks in {column.title.toLowerCase()}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function KanbanBoard({ tasks, onTaskUpdate, onTaskReorder, projectId }: KanbanBoardProps) {
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const tasksByStatus = React.useMemo(() => {
    const grouped = {
      'not_started': tasks.filter(task => task.status === 'not_started' || (!task.status && !task.isCompleted)),
      'in_progress': tasks.filter(task => task.status === 'in_progress'),
      'completed': tasks.filter(task => task.status === 'completed' || task.isCompleted),
    };
    return grouped;
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Check if we're dropping on a column
    const isOverColumn = columns.some(col => col.id === overId);
    
    if (isOverColumn) {
      const newStatus = overId as TaskStatus;
      const task = tasks.find(t => t.id === activeId);
      
      if (task && task.status !== newStatus) {
        onTaskUpdate(task.id, { 
          status: newStatus,
          completed: newStatus === 'completed' 
        });
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Handle column drops
    const isOverColumn = columns.some(col => col.id === overId);
    
    if (isOverColumn) {
      const newStatus = overId as TaskStatus;
      const task = tasks.find(t => t.id === activeId);
      
      if (task && task.status !== newStatus) {
        try {
          await apiRequest(`/api/tasks/${task.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ 
              status: newStatus,
              completed: newStatus === 'completed' 
            })
          });

          // Show success message
          toast.success(
            newStatus === 'completed' 
              ? `🎉 "${task.title}" completed!` 
              : `Task moved to ${newStatus === 'in_progress' ? 'In Progress' : 'To Do'}`,
            {
              duration: 2000,
              style: {
                background: newStatus === 'completed' ? '#10b981' : '#8b5cf6',
                color: 'white',
              }),
            })
          );

          // Invalidate queries
          queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
          queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'tasks'] });
          queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });

          onTaskUpdate(task.id, { 
            status: newStatus, 
            completed: newStatus === 'completed' 
          });
        } catch (error) {

          toast.error('Failed to update task');
        }
      }
    }
  };

  const activeTask = activeId ? tasks.find(task => task.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasksByStatus[column.id]}
            onTaskUpdate={onTaskUpdate}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <KanbanTask 
            task={activeTask} 
            onToggle={() => {}} 
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}