import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { differenceInDays } from "date-fns";
import { WeddingProject, DashboardStats } from "@/types";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Zap
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  progress?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  urgency?: 'high' | 'medium' | 'low';
}

function StatCard({ title, value, subtitle, progress, trend, icon: Icon, urgency }: StatCardProps) {
  const getUrgencyColor = () => {
    switch (urgency) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return null;
  };

  return (
    <Card className={`transition-all hover:shadow-md ${getUrgencyColor()}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className="flex items-center space-x-1">
          {getTrendIcon()}
          <Icon className="h-4 w-4 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
        {progress !== undefined && (
          <div className="mt-3">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">{progress}% complete</p>
          </div>
        )}
        {urgency === 'high' && (
          <Badge variant="destructive" className="mt-2 text-xs">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Needs attention
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

export default function EnhancedDashboardStats() {
  const { data: dashboardStats } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    enabled: true,
  });

  const { data: projects } = useQuery<WeddingProject[]>({
    queryKey: ['/api/projects'],
    enabled: true,
  });

  const currentProject = projects?.find(p => p.name === "Emma & Jake's Wedding") || projects?.[0];

  if (!dashboardStats || !currentProject) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate days until wedding using same method as header for consistency
  const daysUntil = currentProject?.weddingDate ? differenceInDays(new Date(currentProject.weddingDate), new Date()) : 0;

  // Task completion rate
  const taskCompletionRate = dashboardStats.tasks?.total > 0 
    ? Math.round((dashboardStats.tasks.completed / dashboardStats.tasks.total) * 100)
    : 0;

  // Budget usage rate
  const budgetUsageRate = dashboardStats.budget?.total > 0
    ? Math.round((dashboardStats.budget.spent / dashboardStats.budget.total) * 100)
    : 0;

  // RSVP rate: guests who have responded (confirmed + declined) vs total
  const rsvpRate = dashboardStats.guests?.total > 0
    ? Math.round(((dashboardStats.guests.confirmed + (dashboardStats.guests.declined || 0)) / dashboardStats.guests.total) * 100)
    : 0;

  // Vendor completion rate
  const vendorBookedRate = dashboardStats.vendors?.total > 0
    ? Math.round((dashboardStats.vendors.booked / dashboardStats.vendors.total) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <StatCard
        title="Tasks Progress"
        value={`${dashboardStats.tasks?.completed || 0}/${dashboardStats.tasks?.total || 0}`}
        subtitle={`${taskCompletionRate}% used`}
        progress={taskCompletionRate}
        icon={CheckCircle2}
        urgency={(dashboardStats.tasks?.overdue || 0) > 0 ? 'high' : taskCompletionRate < 50 ? 'medium' : 'low'}
        trend={taskCompletionRate > 70 ? 'up' : taskCompletionRate < 30 ? 'down' : 'neutral'}
      />
      
      <StatCard
        title="Budget Usage"
        value={`$${dashboardStats.budget?.spent?.toLocaleString() || 0}`}
        subtitle={`${budgetUsageRate}% of $${dashboardStats.budget?.total?.toLocaleString() || 0}`}
        progress={budgetUsageRate}
        icon={DollarSign}
        urgency={budgetUsageRate > 90 ? 'high' : budgetUsageRate > 75 ? 'medium' : 'low'}
        trend={budgetUsageRate > 85 ? 'up' : 'neutral'}
      />
      
      <StatCard
        title="Guest RSVPs"
        value={`${(dashboardStats.guests?.confirmed || 0) + (dashboardStats.guests?.declined || 0)}/${dashboardStats.guests?.total || 0}`}
        subtitle={`${rsvpRate}% responded`}
        progress={rsvpRate}
        icon={Users}
        urgency={(dashboardStats.guests?.pending || 0) > 10 ? 'high' : (dashboardStats.guests?.pending || 0) > 5 ? 'medium' : 'low'}
        trend={rsvpRate > 70 ? 'up' : 'neutral'}
      />
    </div>
  );
}

function VendorStatsCard() {
  const { data: dashboardStats } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    enabled: true,
  });

  if (!dashboardStats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
        <Card className="animate-pulse">
          <CardContent className="p-4">
            <div className="h-20 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const vendorBookedRate = dashboardStats.vendors?.total > 0
    ? Math.round(((dashboardStats.vendors.booked || 0) / dashboardStats.vendors.total) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
      <StatCard
        title="Vendors"
        value={`${dashboardStats?.vendors?.booked || 0} of ${dashboardStats?.vendors?.total || 0} booked`}
        subtitle={`${vendorBookedRate}% completed`}
        progress={vendorBookedRate}
        icon={Zap}
        urgency={(dashboardStats?.vendors?.total || 0) > 0 && (dashboardStats?.vendors?.booked || 0) === 0 ? 'high' : 'low'}
        trend={vendorBookedRate > 50 ? 'up' : 'neutral'}
      />
    </div>
  );
}
