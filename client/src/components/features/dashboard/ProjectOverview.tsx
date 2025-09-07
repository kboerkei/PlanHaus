import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, Clock, Users, DollarSign, Heart, CheckCircle, AlertTriangle, 
  TrendingUp, MapPin, Camera, Music, Utensils, FileText, Star
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import type { WeddingProject as Project, Task, BudgetItem, Guest, Vendor } from '@/types';

interface ProjectOverviewProps {
  projectId: number;
}

export default function ProjectOverview({ projectId }: ProjectOverviewProps) {
  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`]
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: [`/api/projects/${projectId}/tasks`]
  });

  const { data: budget = [] } = useQuery<BudgetItem[]>({
    queryKey: [`/api/projects/${projectId}/budget`]
  });

  const { data: guests = [] } = useQuery<Guest[]>({
    queryKey: [`/api/projects/${projectId}/guests`]
  });

  const { data: vendors = [] } = useQuery<Vendor[]>({
    queryKey: [`/api/projects/${projectId}/vendors`]
  });

  // Calculate statistics
  const daysUntilWedding = project?.weddingDate ? differenceInDays(new Date(project.weddingDate), new Date()) : 0;
  const completedTasks = tasks.filter((task: Task) => task.isCompleted || task.completed).length;
  const totalTasks = tasks.length;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const totalBudget = budget.reduce((sum: number, item: BudgetItem) => {
    const cost = typeof item.estimatedCost === 'string' ? parseFloat(item.estimatedCost) || 0 : item.estimatedCost || 0;
    return sum + cost;
  }, 0);
  const actualSpent = budget.reduce((sum: number, item: BudgetItem) => {
    const cost = typeof item.actualCost === 'string' ? parseFloat(item.actualCost) || 0 : item.actualCost || 0;
    return sum + cost;
  }, 0);
  const budgetProgress = totalBudget > 0 ? (actualSpent / totalBudget) * 100 : 0;

  const confirmedGuests = guests.filter((guest: Guest) => guest.rsvpStatus === 'confirmed').length;
  const totalGuests = guests.length;
  const rsvpProgress = totalGuests > 0 ? (confirmedGuests / totalGuests) * 100 : 0;

  const bookedVendors = vendors.filter((vendor: Vendor) => vendor.bookingStatus === 'booked').length;
  const totalVendors = vendors.length;
  const vendorProgress = totalVendors > 0 ? (bookedVendors / totalVendors) * 100 : 0;

  // Categorize tasks by urgency
  const urgentTasks = tasks.filter((task: Task) => !task.completed && task.priority === 'high').length;
  const overdueTasks = tasks.filter((task: Task) => {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date();
  }).length;

  // Calculate overall progress
  const overallProgress = (taskProgress + rsvpProgress + vendorProgress) / 3;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressVariant = (percentage: number) => {
    if (percentage >= 80) return "default";
    if (percentage >= 60) return "secondary";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      {/* Wedding Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Heart className="h-6 w-6 text-rose-500" />
          <h1 className="text-3xl font-bold text-gray-900">{project?.name || 'Your Wedding'}</h1>
          <Heart className="h-6 w-6 text-rose-500" />
        </div>
        {project?.weddingDate && (
          <div className="text-lg text-gray-600">
            {format(new Date(project.weddingDate), 'MMMM d, yyyy')}
            {daysUntilWedding > 0 && (
              <span className="ml-2 text-rose-600 font-semibold">
                • {daysUntilWedding} days to go!
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Wedding Countdown */}
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Calendar className="h-5 w-5 text-rose-500" />
              <Badge variant="outline" className="bg-rose-50 text-rose-700">
                {daysUntilWedding > 0 ? `${daysUntilWedding} days` : 'Today!'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 mb-1">
              {daysUntilWedding > 0 ? daysUntilWedding : '🎉'}
            </div>
            <p className="text-sm text-gray-600">
              {daysUntilWedding > 0 ? 'Days until wedding' : 'Wedding Day!'}
            </p>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-100 to-rose-200 rounded-full transform translate-x-8 -translate-y-8 opacity-50" />
          </CardContent>
        </Card>

        {/* Task Progress */}
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              <Badge variant={getProgressVariant(taskProgress)} className="bg-blue-50 text-blue-700">
                {taskProgress.toFixed(0)}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {completedTasks}/{totalTasks}
            </div>
            <p className="text-sm text-gray-600 mb-3">Tasks completed</p>
            <Progress value={taskProgress} className="h-2" />
            {urgentTasks > 0 && (
              <p className="text-xs text-red-600 mt-1">
                {urgentTasks} urgent task{urgentTasks > 1 ? 's' : ''} remaining
              </p>
            )}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full transform translate-x-8 -translate-y-8 opacity-50" />
          </CardContent>
        </Card>

        {/* Budget Progress */}
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <DollarSign className="h-5 w-5 text-green-500" />
              <Badge variant={getProgressVariant(budgetProgress)} className="bg-green-50 text-green-700">
                {budgetProgress.toFixed(0)}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 mb-1">
              ${actualSpent.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600 mb-3">of ${totalBudget.toLocaleString()} budget</p>
            <Progress value={budgetProgress} className="h-2" />
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full transform translate-x-8 -translate-y-8 opacity-50" />
          </CardContent>
        </Card>

        {/* Guest RSVP Progress */}
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Users className="h-5 w-5 text-purple-500" />
              <Badge variant={getProgressVariant(rsvpProgress)} className="bg-purple-50 text-purple-700">
                {rsvpProgress.toFixed(0)}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {confirmedGuests}/{totalGuests}
            </div>
            <p className="text-sm text-gray-600 mb-3">RSVPs confirmed</p>
            <Progress value={rsvpProgress} className="h-2" />
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full transform translate-x-8 -translate-y-8 opacity-50" />
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            <span>Overall Wedding Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Overall Completion</span>
                <span className={`font-semibold ${getProgressColor(overallProgress)}`}>
                  {overallProgress.toFixed(1)}%
                </span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600">
                {overallProgress.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Tasks: {taskProgress.toFixed(0)}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm">RSVPs: {rsvpProgress.toFixed(0)}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Vendors: {vendorProgress.toFixed(0)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts & Reminders */}
      {(urgentTasks > 0 || overdueTasks > 0 || budgetProgress > 90) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <span>Attention Required</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {urgentTasks > 0 && (
                <div className="flex items-center space-x-2 text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">
                    {urgentTasks} urgent task{urgentTasks > 1 ? 's' : ''} need{urgentTasks === 1 ? 's' : ''} attention
                  </span>
                </div>
              )}
              {overdueTasks > 0 && (
                <div className="flex items-center space-x-2 text-red-700">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    {overdueTasks} task{overdueTasks > 1 ? 's' : ''} overdue
                  </span>
                </div>
              )}
              {budgetProgress > 90 && (
                <div className="flex items-center space-x-2 text-yellow-700">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">
                    Budget is {budgetProgress.toFixed(0)}% used - monitor spending carefully
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}