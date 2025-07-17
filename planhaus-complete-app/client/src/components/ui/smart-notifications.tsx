import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, X, CheckCircle, AlertTriangle, Clock, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: 'task' | 'deadline' | 'budget' | 'guest' | 'vendor';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  actionUrl?: string;
  createdAt: Date;
}

export default function SmartNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    enabled: true,
  });

  const { data: projects } = useQuery({
    queryKey: ['/api/projects'],
    enabled: true,
  });

  const currentProject = projects?.find(p => p.name === "Emma & Jake's Wedding") || projects?.[0];

  // Generate intelligent notifications based on data
  useEffect(() => {
    if (!dashboardStats || !currentProject) return;

    const newNotifications: Notification[] = [];

    // Task-based notifications
    if (dashboardStats.tasks?.overdue > 0) {
      newNotifications.push({
        id: 'overdue-tasks',
        type: 'task',
        priority: 'high',
        title: 'Overdue Tasks',
        message: `You have ${dashboardStats.tasks.overdue} overdue tasks`,
        actionUrl: '/timeline',
        createdAt: new Date(),
      });
    }

    // Budget alerts
    const budgetUsed = dashboardStats.budget?.spent || 0;
    const totalBudget = dashboardStats.budget?.total || 0;
    const budgetPercentage = totalBudget > 0 ? (budgetUsed / totalBudget) * 100 : 0;

    if (budgetPercentage > 90) {
      newNotifications.push({
        id: 'budget-warning',
        type: 'budget',
        priority: 'high',
        title: 'Budget Alert',
        message: `You've used ${budgetPercentage.toFixed(0)}% of your budget`,
        actionUrl: '/budget',
        createdAt: new Date(),
      });
    }

    // RSVP reminders
    if (dashboardStats.guests?.pending > 5) {
      newNotifications.push({
        id: 'pending-rsvps',
        type: 'guest',
        priority: 'medium',
        title: 'Pending RSVPs',
        message: `${dashboardStats.guests.pending} guests haven't responded yet`,
        actionUrl: '/guests',
        createdAt: new Date(),
      });
    }

    // Wedding date countdown
    if (currentProject?.date) {
      const weddingDate = new Date(currentProject.date);
      const today = new Date();
      const daysUntil = Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil <= 30 && daysUntil > 0) {
        newNotifications.push({
          id: 'wedding-countdown',
          type: 'deadline',
          priority: 'medium',
          title: 'Wedding Countdown',
          message: `Only ${daysUntil} days until your wedding!`,
          createdAt: new Date(),
        });
      }
    }

    setNotifications(newNotifications);
  }, [dashboardStats, currentProject]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'task': return Clock;
      case 'deadline': return Calendar;
      case 'budget': return AlertTriangle;
      case 'guest': return CheckCircle;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-50 touch-manipulation"
      >
        <Bell size={20} />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell size={32} className="mx-auto mb-2 text-gray-300" />
                <p>No new notifications</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = getIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    className="p-4 border-b border-gray-50 hover:bg-gray-25 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={cn("p-2 rounded-lg", getPriorityColor(notification.priority))}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-800 truncate">
                            {notification.title}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {notification.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        {notification.actionUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2 text-xs"
                            onClick={() => {
                              window.location.href = notification.actionUrl!;
                              setIsOpen(false);
                            }}
                          >
                            Take Action
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-100">
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                onClick={() => setNotifications([])}
              >
                Clear All
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}