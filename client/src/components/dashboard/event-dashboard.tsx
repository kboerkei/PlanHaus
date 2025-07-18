import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, CheckSquare, DollarSign, UserCheck, MapPin, Lightbulb, Clock, Plus } from "lucide-react";
import { getEventConfig, getEventDisplayName } from "@/config/eventDashboardConfigs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { format, differenceInDays } from "date-fns";

interface EventDashboardProps {
  eventType: string;
  user: any;
}

export default function EventDashboard({ eventType, user }: EventDashboardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const config = getEventConfig(eventType);
  const Icon = config.icon;

  // Fetch projects and stats
  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects'],
    queryFn: () => apiRequest('/api/projects')
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    queryFn: () => apiRequest('/api/dashboard/stats')
  });

  const currentProject = projects.find(p => p.eventType === eventType) || projects[0];

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      if (!currentProject) throw new Error('No project found');
      return await apiRequest(`/api/projects/${currentProject.id}/tasks`, {
        method: 'POST',
        body: taskData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Task Created",
        description: "New planning task has been added to your timeline.",
      });
    }
  });

  const handleQuickAction = (action: any) => {
    if (action.action === 'create-task') {
      createTaskMutation.mutate({
        title: action.data.title,
        description: `Auto-generated task for ${getEventDisplayName(eventType).toLowerCase()} planning`,
        category: action.data.category || 'general',
        priority: 'medium'
      });
    }
  };

  const getEventDate = () => {
    if (!currentProject?.date) return null;
    return new Date(currentProject.date);
  };

  const getDaysUntilEvent = () => {
    const eventDate = getEventDate();
    if (!eventDate) return null;
    return differenceInDays(eventDate, new Date());
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-blue-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const daysUntil = getDaysUntilEvent();
  const eventDate = getEventDate();

  return (
    <div className="space-y-6">
      {/* Event Header */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-6 border border-rose-100">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 bg-gradient-to-br from-${config.primaryColor}-100 to-${config.primaryColor}-200 rounded-full flex items-center justify-center`}>
            <Icon className={`w-6 h-6 text-${config.primaryColor}-600`} />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-gray-800">
              {config.title}
            </h1>
            <p className="text-gray-600">{config.welcomeMessage}</p>
          </div>
        </div>
        
        {currentProject && eventDate && (
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{format(eventDate, 'MMMM d, yyyy')}</span>
            </div>
            {daysUntil !== null && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  {daysUntil > 0 ? `${daysUntil} days to go` : 
                   daysUntil === 0 ? 'Today!' : 
                   `${Math.abs(daysUntil)} days ago`}
                </span>
              </div>
            )}
            <Badge variant="outline" className={`text-${config.primaryColor}-600 border-${config.primaryColor}-200`}>
              {getEventDisplayName(eventType)}
            </Badge>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common tasks to help you get started with your {getEventDisplayName(eventType).toLowerCase()} planning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {config.quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action)}
                disabled={createTaskMutation.isPending}
                className="text-left flex items-center gap-2 h-auto p-3"
              >
                <Plus className="w-4 h-4" />
                <span className="text-xs">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Tasks</span>
                </div>
                <span className="text-xs text-gray-500">
                  {stats.tasks?.completed || 0}/{stats.tasks?.total || 0}
                </span>
              </div>
              <Progress 
                value={stats.tasks?.total > 0 ? (stats.tasks.completed / stats.tasks.total) * 100 : 0} 
                className="h-2"
              />
              <p className="text-xs text-gray-600 mt-1">
                {Math.round(stats.tasks?.total > 0 ? (stats.tasks.completed / stats.tasks.total) * 100 : 0)}% complete
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Budget</span>
                </div>
                <span className="text-xs text-gray-500">
                  ${stats.budget?.spent || 0}/${stats.budget?.total || 0}
                </span>
              </div>
              <Progress 
                value={stats.budget?.total > 0 ? (stats.budget.spent / stats.budget.total) * 100 : 0} 
                className="h-2"
              />
              <p className="text-xs text-gray-600 mt-1">
                {Math.round(stats.budget?.total > 0 ? (stats.budget.spent / stats.budget.total) * 100 : 0)}% spent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">RSVPs</span>
                </div>
                <span className="text-xs text-gray-500">
                  {stats.guests?.confirmed || 0}/{stats.guests?.total || 0}
                </span>
              </div>
              <Progress 
                value={stats.guests?.total > 0 ? (stats.guests.confirmed / stats.guests.total) * 100 : 0} 
                className="h-2"
              />
              <p className="text-xs text-gray-600 mt-1">
                {Math.round(stats.guests?.total > 0 ? (stats.guests.confirmed / stats.guests.total) * 100 : 0)}% confirmed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium">Vendors</span>
                </div>
                <span className="text-xs text-gray-500">
                  {stats.vendors?.booked || 0}/{stats.vendors?.total || 0}
                </span>
              </div>
              <Progress 
                value={stats.vendors?.total > 0 ? (stats.vendors.booked / stats.vendors.total) * 100 : 0} 
                className="h-2"
              />
              <p className="text-xs text-gray-600 mt-1">
                {Math.round(stats.vendors?.total > 0 ? (stats.vendors.booked / stats.vendors.total) * 100 : 0)}% booked
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Planning Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {config.sections.map((section) => (
          <Card key={section.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <section.icon className={`w-5 h-5 text-${config.primaryColor}-600`} />
                {section.name}
              </CardTitle>
              <CardDescription className="text-sm">
                {section.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link href={`/${section.id}`}>
                <Button variant="outline" className="w-full">
                  Open {section.name}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Suggestions Placeholder */}
      <Card className="border-dashed border-2 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-500">
            <Lightbulb className="w-5 h-5" />
            AI-Powered Suggestions
          </CardTitle>
          <CardDescription>
            Personalized recommendations based on your {getEventDisplayName(eventType).toLowerCase()} preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">AI suggestions will appear here based on your intake form responses</p>
            <p className="text-xs mt-2">Coming soon: Vendor recommendations, timeline optimization, and budget insights</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}