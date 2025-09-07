import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
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
import { Progress } from '@/components/ui/progress';
import { CalendarDays, Clock, Users, AlertTriangle, CheckCircle2, Star } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { formatDistanceToNow } from 'date-fns';
import type { Task as TaskType, TaskUpdate } from '@/types/task';

interface DragDropTimelineProps {
  tasks: TaskType[];
  onTaskUpdate: (taskId: number, updates: TaskUpdate) => void;
  onTaskReorder: (tasks: TaskType[]) => void;
  projectId: number;
}

interface SortableTaskProps {
  task: TaskType;
  onToggle: (taskId: number, completed: boolean) => void;
}

function SortableTask({ task, onToggle }: SortableTaskProps) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'not_started': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const isCompleted = task.status === 'completed';
  const isOverdue = task.dueDate && !isCompleted && new Date(task.dueDate) < new Date();
  const isDueSoon = task.dueDate && !isCompleted && new Date(task.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const handleToggle = (completed: boolean) => {
    onToggle(task.id, completed);
    
    // Celebration animation for completed tasks
    if (completed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#ec4899', '#8b5cf6', '#06b6d4'],
      });
      toast.success(`🎉 Great job! "${task.title}" completed!`, {
        duration: 3000,
        style: {
          background: '#10b981',
          color: 'white',
        },
      });
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`mb-4 transition-all duration-200 ${
        isDragging ? 'shadow-lg scale-105 rotate-1' : 'shadow-sm hover:shadow-md'
      } ${isCompleted ? 'opacity-75 bg-gray-50' : ''} ${
        isOverdue ? 'border-red-300 bg-red-50' : ''
      } ${isDueSoon ? 'border-yellow-300 bg-yellow-50' : ''}`}
      {...attributes}
      {...listeners}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <Checkbox
              checked={isCompleted}
              onCheckedChange={handleToggle}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <CardTitle className={`text-lg ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                {task.title}
              </CardTitle>
              {task.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isOverdue && (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
            {isCompleted && (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
            {task.priority === 'high' && (
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className={getPriorityColor(task.priority)}>
            {task.priority} priority
          </Badge>
          
          <Badge variant="outline" className={getStatusColor(task.status)}>
            {task.status}
          </Badge>
          
          {task.assignedTo && (
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              <Users className="w-3 h-3 mr-1" />
              {task.assignedTo}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            {task.dueDate && (
              <div className="flex items-center space-x-1">
                <CalendarDays className="w-4 h-4" />
                <span className={isOverdue ? 'text-red-600 font-medium' : isDueSoon ? 'text-yellow-600' : ''}>
                  {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                </span>
              </div>
            )}
            
            {task.estimatedHours && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{task.estimatedHours}h</span>
              </div>
            )}
          </div>
          
          {task.category && (
            <Badge variant="secondary" className="text-xs">
              {task.category}
            </Badge>
          )}
        </div>

        {/* Progress bar for in-progress tasks */}
        {task.status === 'in_progress' && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>75%</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DragDropTimeline({ tasks, onTaskUpdate, onTaskReorder, projectId }: DragDropTimelineProps) {
  const [orderedTasks, setOrderedTasks] = useState<TaskType[]>(tasks);
  const queryClient = useQueryClient();

  useEffect(() => {
    setOrderedTasks(tasks);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = orderedTasks.findIndex(task => task.id === active.id);
      const newIndex = orderedTasks.findIndex(task => task.id === over?.id);

      const newOrderedTasks = arrayMove(orderedTasks, oldIndex, newIndex);
      setOrderedTasks(newOrderedTasks);
      onTaskReorder(newOrderedTasks);

      // Show feedback
      toast.success('Task order updated!', {
        duration: 2000,
        style: {
          background: '#8b5cf6',
          color: 'white',
        },
      });
    }
  };

  const handleTaskToggle = async (taskId: number, completed: boolean) => {
    try {
      await apiRequest(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: completed ? 'completed' : 'not_started' })
      });

      // Update local state
      setOrderedTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, status: completed ? 'completed' : 'not_started' } : task
        )
      );

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });

      onTaskUpdate(taskId, { status: completed ? 'completed' : 'not_started' });
    } catch (error) {

      toast.error('Failed to update task');
    }
  };

  const completedTasks = orderedTasks.filter(task => task.status === 'completed');
  const pendingTasks = orderedTasks.filter(task => task.status !== 'completed');

  return (
    <div className="space-y-6">
      {/* Timeline Progress Overview */}
      <Card className="bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarDays className="text-rose-600" />
            <span>Timeline Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-600">
              {completedTasks.length} of {orderedTasks.length} tasks completed
            </span>
          </div>
          <Progress 
            value={(completedTasks.length / orderedTasks.length) * 100} 
            className="h-3"
          />
        </CardContent>
      </Card>

      {/* Drag & Drop Task List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Tasks */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Clock className="text-blue-600" />
              <span>Upcoming Tasks ({pendingTasks.length})</span>
            </h3>
            <SortableContext items={pendingTasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
              {pendingTasks.map(task => (
                <SortableTask key={task.id} task={task} onToggle={handleTaskToggle} />
              ))}
            </SortableContext>
          </div>

          {/* Completed Tasks */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <CheckCircle2 className="text-green-600" />
              <span>Completed Tasks ({completedTasks.length})</span>
            </h3>
            <div className="space-y-4">
              {completedTasks.map(task => (
                <SortableTask key={task.id} task={task} onToggle={handleTaskToggle} />
              ))}
            </div>
          </div>
        </div>
      </DndContext>
    </div>
  );
}