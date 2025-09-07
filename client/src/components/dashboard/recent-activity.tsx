import { Bot, CheckCircle, Users, Heart, DollarSign, Calendar, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { WeddingProject, Activity } from "@/types";

const actionIcons = {
  'completed': CheckCircle,
  'created task': Calendar,
  'added guest': Users,
  'added vendor': Heart,
  'added budget item': DollarSign,
  'created': Calendar,
  'updated': Clock,
  'default': Clock
};

const actionColors = {
  'completed': 'bg-green-500',
  'created task': 'bg-blue-500',
  'added guest': 'bg-purple-500',
  'added vendor': 'bg-pink-500',
  'added budget item': 'bg-green-600',
  'created': 'bg-blue-500',
  'updated': 'bg-orange-500',
  'default': 'bg-gray-500'
};

export default function RecentActivity() {
  const { data: projects } = useQuery<WeddingProject[]>({
    queryKey: ['/api/projects'],
    enabled: !!localStorage.getItem('sessionId')
  });

  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ['/api/projects', projects?.[0]?.id, 'activities'],
    enabled: !!projects?.[0]?.id
  });

  const recentActivities = activities.slice(0, 5);

  const getActivityIcon = (action: string) => {
    return (actionIcons as any)[action] || actionIcons.default;
  };

  const getActivityColor = (action: string) => {
    return (actionColors as any)[action] || actionColors.default;
  };

  const formatActivityText = (activity: Activity) => {
    if (activity.details?.taskTitle) {
      return `${activity.action} "${activity.details.taskTitle}"`;
    }
    if (activity.details?.guestName) {
      return `${activity.action} ${activity.details.guestName}`;
    }
    if (activity.details?.vendorName) {
      return `${activity.action} ${activity.details.vendorName}`;
    }
    return activity.action;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg font-semibold text-gray-800">Recent Activity</h3>
        <Link href="/timeline">
          <Button variant="ghost" size="sm" className="text-blush hover:bg-gray-50">
            View All
          </Button>
        </Link>
      </div>
      
      <div className="space-y-4">
        {recentActivities.length > 0 ? (
          recentActivities.map((activity) => {
            const Icon = getActivityIcon(activity.action);
            const colorClass = getActivityColor(activity.action);
            
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 ${colorClass} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <Icon className="text-white" size={12} />
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">Someone</span>{' '}
                    <span className="text-gray-600">{formatActivityText(activity)}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No activity yet</p>
            <p className="text-sm text-gray-500 mb-4">Start planning to see updates here</p>
            <div className="flex space-x-2 justify-center">
              <Link href="/timeline">
                <Button size="sm" className="bg-blush hover:bg-blush/90 text-white">
                  Add Task
                </Button>
              </Link>
              <Link href="/guests">
                <Button size="sm" variant="outline">
                  Add Guest
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
