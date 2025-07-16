import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, DollarSign, Heart, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

interface ProjectStatsProps {
  projectStats: {
    daysUntilWedding: number;
    tasksCompleted: number;
    totalTasks: number;
    budgetUsed: number;
    totalBudget: number;
    guestsConfirmed: number;
    totalGuests: number;
    vendorsBooked: number;
    totalVendors: number;
  };
}

export default function ProjectStats({ projectStats }: ProjectStatsProps) {
  const {
    daysUntilWedding,
    tasksCompleted,
    totalTasks,
    budgetUsed,
    totalBudget,
    guestsConfirmed,
    totalGuests,
    vendorsBooked,
    totalVendors
  } = projectStats;

  const taskProgress = totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0;
  const budgetProgress = totalBudget > 0 ? (budgetUsed / totalBudget) * 100 : 0;
  const guestProgress = totalGuests > 0 ? (guestsConfirmed / totalGuests) * 100 : 0;
  const vendorProgress = totalVendors > 0 ? (vendorsBooked / totalVendors) * 100 : 0;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressVariant = (percentage: number) => {
    if (percentage >= 90) return "default";
    if (percentage >= 70) return "secondary";
    return "destructive";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
            {daysUntilWedding > 0 ? 'Days until your wedding' : 'Wedding Day!'}
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
            {tasksCompleted}/{totalTasks}
          </div>
          <p className="text-sm text-gray-600 mb-3">Tasks completed</p>
          <Progress value={taskProgress} className="h-2" />
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
            ${budgetUsed.toLocaleString()}
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
            <Badge variant={getProgressVariant(guestProgress)} className="bg-purple-50 text-purple-700">
              {guestProgress.toFixed(0)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {guestsConfirmed}/{totalGuests}
          </div>
          <p className="text-sm text-gray-600 mb-3">RSVPs confirmed</p>
          <Progress value={guestProgress} className="h-2" />
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full transform translate-x-8 -translate-y-8 opacity-50" />
        </CardContent>
      </Card>
    </div>
  );
}