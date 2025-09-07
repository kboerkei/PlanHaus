import { memo, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { LoadingSpinner, SkeletonStats } from "@/components/ui/enhanced-loading";
import { EnhancedCard, StatCard, ProgressCard } from "@/components/ui/enhanced-cards";
import { usePerformanceMonitor } from "@/hooks/usePerformanceOptimization";
import { apiRequest } from "@/lib/queryClient";
import { DashboardStats } from "@/types";
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Store, 
  CheckCircle2, 
  Clock, 
  Heart,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { format, differenceInDays } from "date-fns";

// Optimized dashboard with single API call and memoized calculations
export const OptimizedDashboard = memo(() => {
  const getMetrics = usePerformanceMonitor("OptimizedDashboard");

  // Single dashboard stats query with proper caching
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    queryFn: () => apiRequest<DashboardStats>('/api/dashboard/stats'),
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
  });

  // Memoized calculations
  const calculations = useMemo(() => {
    if (!stats) return null;

    const taskProgress = stats.tasks.total > 0 ? 
      (stats.tasks.completed / stats.tasks.total) * 100 : 0;
    
    const budgetProgress = stats.budget.total > 0 ? 
      (stats.budget.spent / stats.budget.total) * 100 : 0;
    
    const guestProgress = stats.guests.total > 0 ? 
      ((stats.guests.confirmed + (stats.guests.declined || 0)) / stats.guests.total) * 100 : 0;
    
    const vendorProgress = stats.vendors.total > 0 ? 
      (stats.vendors.booked / stats.vendors.total) * 100 : 0;

    return {
      taskProgress,
      budgetProgress,
      guestProgress,
      vendorProgress,
      isOverBudget: budgetProgress > 100,
      hasOverdueTasks: (stats.tasks?.overdue || 0) > 0,
      lowGuestResponse: guestProgress < 50 && stats.guests.total > 0
    };
  }, [stats]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonStats />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="animate-pulse bg-gray-200 rounded-lg h-64" />
          <div className="animate-pulse bg-gray-200 rounded-lg h-64" />
        </div>
      </div>
    );
  }

  if (error || !stats || !calculations) {
    return (
      <EnhancedCard 
        title="Dashboard Error"
        className="border-red-200 bg-red-50"
      >
        <div className="flex items-center gap-3 text-red-700">
          <AlertTriangle className="h-5 w-5" />
          <p>Unable to load dashboard data. Please refresh the page.</p>
        </div>
      </EnhancedCard>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Performance metrics in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-muted-foreground">
          {JSON.stringify(getMetrics())}
        </div>
      )}

      {/* Alert Cards for Critical Issues */}
      {(calculations.isOverBudget || calculations.hasOverdueTasks || calculations.lowGuestResponse) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {calculations.isOverBudget && (
            <EnhancedCard
              title="Budget Alert"
              badge="Over Budget"
              badgeVariant="destructive"
              className="border-red-200 bg-red-50"
            >
              <p className="text-sm text-red-700">
                You're {(calculations.budgetProgress - 100).toFixed(1)}% over budget
              </p>
            </EnhancedCard>
          )}
          
          {calculations.hasOverdueTasks && (
            <EnhancedCard
              title="Overdue Tasks"
              badge={`${stats.tasks.overdue} Tasks`}
              badgeVariant="destructive"
              className="border-orange-200 bg-orange-50"
            >
              <p className="text-sm text-orange-700">
                You have {stats.tasks.overdue} overdue tasks requiring attention
              </p>
            </EnhancedCard>
          )}
          
          {calculations.lowGuestResponse && (
            <EnhancedCard
              title="RSVP Reminder"
              badge="Low Response"
              badgeVariant="outline"
              className="border-yellow-200 bg-yellow-50"
            >
              <p className="text-sm text-yellow-700">
                Only {calculations.guestProgress.toFixed(0)}% of guests have responded
              </p>
            </EnhancedCard>
          )}
        </motion.div>
      )}

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tasks Completed"
          value={`${stats.tasks.completed}/${stats.tasks.total}`}
          change={{
            value: `${calculations.taskProgress.toFixed(0)}% complete`,
            trend: calculations.taskProgress > 70 ? "up" : "neutral"
          }}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        
        <StatCard
          title="Budget Used"
          value={`$${stats.budget.spent.toLocaleString()}`}
          change={{
            value: `${calculations.budgetProgress.toFixed(0)}% of budget`,
            trend: calculations.budgetProgress > 90 ? "down" : "up"
          }}
          icon={<DollarSign className="h-5 w-5" />}
        />
        
        <StatCard
          title="RSVP Responses"
          value={`${(stats.guests.confirmed + (stats.guests.declined || 0))}/${stats.guests.total}`}
          change={{
            value: `${calculations.guestProgress.toFixed(0)}% responded`,
            trend: calculations.guestProgress > 60 ? "up" : "neutral"
          }}
          icon={<Users className="h-5 w-5" />}
        />
        
        <StatCard
          title="Vendors Booked"
          value={`${stats.vendors.booked}/${stats.vendors.total}`}
          change={{
            value: `${calculations.vendorProgress.toFixed(0)}% secured`,
            trend: calculations.vendorProgress > 50 ? "up" : "neutral"
          }}
          icon={<Store className="h-5 w-5" />}
        />
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgressCard
          title="Wedding Planning Progress"
          current={stats.tasks.completed}
          total={stats.tasks.total}
          description="Tasks completed towards your perfect day"
          color="wedding"
        />
        
        <ProgressCard
          title="Budget Management"
          current={stats.budget.spent}
          total={stats.budget.total}
          description="Budget allocation and spending"
          color={calculations.isOverBudget ? "warning" : "success"}
        />
      </div>

      {/* Quick Actions Based on Progress */}
      <EnhancedCard title="Recommended Next Steps">
        <div className="space-y-3">
          {calculations.taskProgress < 50 && (
            <div className="flex items-center gap-3 p-3 bg-blush/5 rounded-lg">
              <Calendar className="h-5 w-5 text-blush" />
              <div>
                <p className="font-medium">Focus on Timeline</p>
                <p className="text-sm text-muted-foreground">
                  Complete more tasks to stay on track
                </p>
              </div>
            </div>
          )}
          
          {calculations.guestProgress < 70 && stats.guests.total > 0 && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Follow up on RSVPs</p>
                <p className="text-sm text-muted-foreground">
                  Reach out to pending guests
                </p>
              </div>
            </div>
          )}
          
          {calculations.vendorProgress < 60 && (
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Store className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Secure More Vendors</p>
                <p className="text-sm text-muted-foreground">
                  Book remaining essential vendors
                </p>
              </div>
            </div>
          )}
        </div>
      </EnhancedCard>
    </motion.div>
  );
});

OptimizedDashboard.displayName = "OptimizedDashboard";