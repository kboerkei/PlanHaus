import { memo, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePerformanceMonitor } from '@/hooks/usePerformance';
import { SkeletonCard } from '@/components/ui/SkeletonLoader';

interface DashboardStats {
  tasks: {
    total: number;
    completed: number;
  };
  guests: {
    total: number;
    confirmed: number;
    pending: number;
  };
  budget: {
    total: number;
    spent: number;
  };
  vendors: {
    total: number;
    booked: number;
  };
  daysUntilWedding: number;
}

interface OptimizedDashboardProps {
  projectId: number;
}

// Memoized stats card component
const StatsCard = memo(({ 
  title, 
  value, 
  subtitle, 
  color = 'blush' 
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string;
  color?: string;
}) => (
  <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 border-${color}`}>
    <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
    <div className="text-2xl font-bold text-gray-900">{value}</div>
    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
  </div>
));

StatsCard.displayName = 'StatsCard';

export const OptimizedDashboard = memo(({ projectId }: OptimizedDashboardProps) => {
  usePerformanceMonitor('OptimizedDashboard');

  // Single API call for all dashboard data with proper caching
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats', projectId],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!projectId,
  });

  // Memoize computed values to prevent unnecessary recalculations
  const computedStats = useMemo(() => {
    if (!stats) return null;

    const taskProgress = stats.tasks.total > 0 
      ? Math.round((stats.tasks.completed / stats.tasks.total) * 100)
      : 0;

    const budgetProgress = stats.budget.total > 0
      ? Math.round((stats.budget.spent / stats.budget.total) * 100)
      : 0;

    const guestResponse = stats.guests.total > 0
      ? Math.round((stats.guests.confirmed / stats.guests.total) * 100)
      : 0;

    const vendorProgress = stats.vendors.total > 0
      ? Math.round((stats.vendors.booked / stats.vendors.total) * 100)
      : 0;

    return {
      taskProgress,
      budgetProgress,
      guestResponse,
      vendorProgress,
    };
  }, [stats]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonCard key={i} lines={2} />
        ))}
      </div>
    );
  }

  if (error || !stats || !computedStats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Unable to load dashboard stats</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Wedding Countdown"
        value={stats.daysUntilWedding}
        subtitle="days to go"
        color="rose-400"
      />
      
      <StatsCard
        title="Task Progress"
        value={`${computedStats.taskProgress}%`}
        subtitle={`${stats.tasks.completed} of ${stats.tasks.total} complete`}
        color="green-400"
      />
      
      <StatsCard
        title="RSVP Status"
        value={`${computedStats.guestResponse}%`}
        subtitle={`${stats.guests.confirmed} of ${stats.guests.total} confirmed`}
        color="blue-400"
      />
      
      <StatsCard
        title="Budget Used"
        value={`${computedStats.budgetProgress}%`}
        subtitle={`$${stats.budget.spent.toLocaleString()} spent`}
        color="amber-400"
      />
    </div>
  );
});

OptimizedDashboard.displayName = 'OptimizedDashboard';