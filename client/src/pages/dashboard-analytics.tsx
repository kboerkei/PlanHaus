import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays, addDays } from 'date-fns';

// Import adapters
import { toDonut } from '@/lib/analytics/budgetAdapter';
import { toBurndown } from '@/lib/analytics/timelineAdapter';
import { toStatus, getTasksDueThisWeek } from '@/lib/analytics/taskAdapter';
import { toFunnel } from '@/lib/analytics/vendorAdapter';

// Import components
import { KpiCard } from '@/components/dashboard/KpiCard';
import { BudgetDonut } from '@/components/dashboard/BudgetDonut';
import { TimelineBurndown } from '@/components/dashboard/TimelineBurndown';
import { TaskStatusBar } from '@/components/dashboard/TaskStatusBar';
import { VendorFunnel } from '@/components/dashboard/VendorFunnel';
import { MiniCalendar } from '@/components/dashboard/MiniCalendar';
import { Filters } from '@/components/dashboard/Filters';
import { Card } from '@/components/dashboard/Card';
import { 
  KpiCardSkeleton, 
  ChartSkeleton, 
  MiniCalendarSkeleton, 
  FiltersSkeleton 
} from '@/components/dashboard/Skeleton';

// Types
interface Project {
  id: number;
  name: string;
  date: string;
}

interface KPIsData {
  budget: {
    total: number;
    spent: number;
    delta: {
      value: number;
      label: string;
      positive: boolean;
    };
  };
  daysUntilWedding: {
    value: number;
    delta: {
      value: number;
      label: string;
      positive: boolean;
    };
  };
  tasksDueThisWeek: {
    value: number;
    delta: {
      value: number;
      label: string;
      positive: boolean;
    };
  };
  vendorsBooked: {
    value: number;
    delta: {
      value: number;
      label: string;
      positive: boolean;
    };
  };
}

export default function DashboardAnalytics() {
  // State for filters
  const [dateRange, setDateRange] = useState({
    from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    to: format(addDays(new Date(), 30), 'yyyy-MM-dd')
  });
  const [projectId, setProjectId] = useState('');
  const [segment, setSegment] = useState('all');

  // Fetch data
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    enabled: !!localStorage.getItem('sessionId'),
  });

  const { data: kpisData, isLoading: kpisLoading } = useQuery<KPIsData>({
    queryKey: ['/api/analytics/kpis', projectId, dateRange.from, dateRange.to],
    enabled: !!localStorage.getItem('sessionId'),
  });

  const { data: budgetData, isLoading: budgetLoading } = useQuery<any>({
    queryKey: ['/api/analytics/budget', projectId],
    enabled: !!localStorage.getItem('sessionId'),
  });

  const { data: timelineData, isLoading: timelineLoading } = useQuery<any[]>({
    queryKey: ['/api/analytics/timeline', projectId, dateRange.from, dateRange.to],
    enabled: !!localStorage.getItem('sessionId'),
  });

  const { data: vendorsData, isLoading: vendorsLoading } = useQuery<any[]>({
    queryKey: ['/api/analytics/vendors', projectId],
    enabled: !!localStorage.getItem('sessionId'),
  });

  // Transform data using adapters
  const budgetDonutData = useMemo(() => {
    if (!budgetData || typeof budgetData !== 'object') return null;
    return toDonut(budgetData as any);
  }, [budgetData]);

  const timelineBurndownData = useMemo(() => {
    if (!timelineData || !Array.isArray(timelineData)) return null;
    return toBurndown(timelineData as any[], dateRange.from, dateRange.to);
  }, [timelineData, dateRange]);

  const taskStatusData = useMemo(() => {
    if (!timelineData || !Array.isArray(timelineData)) return null;
    return toStatus(timelineData as any[]);
  }, [timelineData]);

  const vendorFunnelData = useMemo(() => {
    if (!vendorsData || !Array.isArray(vendorsData)) return null;
    return toFunnel(vendorsData as any[]);
  }, [vendorsData]);

  // Mock upcoming dates (in a real app, this would come from an API)
  const upcomingDates = useMemo(() => [
    { date: format(addDays(new Date(), 7), 'yyyy-MM-dd'), label: 'Dress Fitting' },
    { date: format(addDays(new Date(), 14), 'yyyy-MM-dd'), label: 'Catering Tasting' },
    { date: format(addDays(new Date(), 21), 'yyyy-MM-dd'), label: 'Venue Walkthrough' },
    { date: format(addDays(new Date(), 28), 'yyyy-MM-dd'), label: 'Photographer Meeting' },
    { date: format(addDays(new Date(), 35), 'yyyy-MM-dd'), label: 'Florist Consultation' },
  ], []);

  // Filter options
  const segments = [
    { value: 'all', label: 'All' },
    { value: 'ceremony', label: 'Ceremony' },
    { value: 'reception', label: 'Reception' },
  ];

  const handleDateRangeChange = (from: string, to: string) => {
    setDateRange({ from, to });
  };

  const handleProjectChange = (newProjectId: string) => {
    setProjectId(newProjectId);
  };

  const handleSegmentChange = (newSegment: string) => {
    setSegment(newSegment);
  };

  if (kpisLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <FiltersSkeleton />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <KpiCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MiniCalendarSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Dashboard</h1>
        <Filters
          dateRange={dateRange}
          projectId={projectId}
          segment={segment}
          onDateRangeChange={handleDateRangeChange}
          onProjectChange={handleProjectChange}
          onSegmentChange={handleSegmentChange}
          projects={projects.map(p => ({ id: p.id.toString(), name: p.name }))}
          segments={segments}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <KpiCard
          title="Total Budget vs Spent"
          value={`$${kpisData?.budget.spent.toLocaleString() || 0}`}
          delta={kpisData?.budget.delta}
          tooltip="Budget spent vs planned"
          onClick={() => window.location.href = '/budget'}
        />
        <KpiCard
          title="Days until Wedding"
          value={kpisData?.daysUntilWedding.value || 0}
          delta={kpisData?.daysUntilWedding.delta}
          tooltip="Days remaining until the big day"
        />
        <KpiCard
          title="Tasks Due This Week"
          value={kpisData?.tasksDueThisWeek.value || 0}
          delta={kpisData?.tasksDueThisWeek.delta}
          tooltip="Tasks due in the next 7 days"
          onClick={() => window.location.href = '/tasks?filter=due-soon'}
        />
        <KpiCard
          title="Vendors Booked"
          value={kpisData?.vendorsBooked.value || 0}
          delta={kpisData?.vendorsBooked.delta}
          tooltip="Vendors with booked status"
          onClick={() => window.location.href = '/vendors?stage=booked'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {budgetDonutData ? (
          <BudgetDonut
            spent={budgetDonutData.spent}
            remaining={budgetDonutData.remaining}
            categories={budgetDonutData.categories}
          />
        ) : (
          <ChartSkeleton />
        )}
        
        {timelineBurndownData ? (
          <TimelineBurndown
            points={timelineBurndownData.points}
            today={timelineBurndownData.today}
          />
        ) : (
          <ChartSkeleton />
        )}
      </div>

      {/* Secondary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {taskStatusData ? (
          <TaskStatusBar segments={taskStatusData.segments} />
        ) : (
          <ChartSkeleton />
        )}
        
        {vendorFunnelData ? (
          <VendorFunnel stages={vendorFunnelData.stages} />
        ) : (
          <ChartSkeleton />
        )}
      </div>

      {/* Right/Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Recent Activity">
            <div className="text-center py-8 text-slate-500">
              Recent activity will be displayed here
            </div>
          </Card>
        </div>
        <MiniCalendar dates={upcomingDates} />
      </div>
    </div>
  );
} 