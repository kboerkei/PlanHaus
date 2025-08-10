import { memo, useMemo, Suspense, lazy } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardSkeleton, CardSkeleton, ChartSkeleton } from "./skeleton-loader";
import { ConsolidatedChart } from "./consolidated-chart";

// Lazy load heavy dashboard components
const LazyEnhancedDashboardStats = lazy(() => import("@/components/enhanced-dashboard-stats"));
const LazyMoodBoard = lazy(() => import("@/components/mood-board"));
const LazyResponsiveDataTable = lazy(() => import("@/components/responsive-data-table"));

interface OptimizedDashboardProps {
  children?: React.ReactNode;
}

// Memoized stat card component
const StatCard = memo(({ title, value, subtitle, icon: Icon }: any) => (
  <Card className="card-elegant">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </CardContent>
  </Card>
));

StatCard.displayName = "StatCard";

// Memoized chart wrapper with performance optimizations
const OptimizedChartWrapper = memo(({ 
  title, 
  data, 
  type, 
  config, 
  height = 300,
  icon: Icon 
}: any) => (
  <Card className="card-elegant">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5" />}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Suspense fallback={<ChartSkeleton />}>
        <ConsolidatedChart 
          type={type}
          data={data}
          config={config}
          height={height}
        />
      </Suspense>
    </CardContent>
  </Card>
));

OptimizedChartWrapper.displayName = "OptimizedChartWrapper";

export const OptimizedDashboard = memo(({ children }: OptimizedDashboardProps) => {
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Memoize computed values to prevent unnecessary recalculations
  const memoizedStats = useMemo(() => {
    if (!dashboardStats) return null;
    
    return {
      tasksCompleted: dashboardStats.tasks?.completed || 0,
      tasksTotal: dashboardStats.tasks?.total || 0,
      guestsConfirmed: dashboardStats.guests?.confirmed || 0,
      guestsTotal: dashboardStats.guests?.total || 0,
      budgetSpent: dashboardStats.budget?.spent || 0,
      budgetTotal: dashboardStats.budget?.total || 0,
      vendorsBooked: dashboardStats.vendors?.booked || 0,
      vendorsTotal: dashboardStats.vendors?.total || 0
    };
  }, [dashboardStats]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Suspense fallback={<CardSkeleton />}>
          <StatCard
            title="Tasks Completed"
            value={`${memoizedStats?.tasksCompleted}/${memoizedStats?.tasksTotal}`}
            subtitle="Wedding planning tasks"
          />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <StatCard
            title="Guest Confirmations"
            value={`${memoizedStats?.guestsConfirmed}/${memoizedStats?.guestsTotal}`}
            subtitle="RSVP responses"
          />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <StatCard
            title="Budget Used"
            value={`$${memoizedStats?.budgetSpent?.toLocaleString()}`}
            subtitle={`of $${memoizedStats?.budgetTotal?.toLocaleString()}`}
          />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <StatCard
            title="Vendors Booked"
            value={`${memoizedStats?.vendorsBooked}/${memoizedStats?.vendorsTotal}`}
            subtitle="Service providers"
          />
        </Suspense>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Stats Component */}
        <Suspense fallback={<ChartSkeleton />}>
          <LazyEnhancedDashboardStats />
        </Suspense>

        {/* Additional optimized components can be added here */}
        {children}
      </div>
    </div>
  );
});

OptimizedDashboard.displayName = "OptimizedDashboard";

export default OptimizedDashboard;