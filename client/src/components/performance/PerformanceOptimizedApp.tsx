import { memo, lazy, Suspense, useMemo } from "react";
import { LazyImage } from "@/components/ui/lazy-image";
import { MemoizedList } from "@/components/ui/memoized-list";
import { ConsolidatedChart } from "@/components/ui/consolidated-chart";
import { DashboardSkeleton, CardSkeleton, ChartSkeleton, TableSkeleton } from "@/components/ui/skeleton-loader";

// Lazy load heavy components
const LazyMoodBoard = lazy(() => import("@/components/shared/mood-board"));
const LazyResponsiveDataTable = lazy(() => import("@/components/shared/responsive-data-table"));
const LazyEnhancedDashboardStats = lazy(() => import("@/components/features/dashboard/enhanced-dashboard-stats"));

interface PerformanceOptimizedAppProps {
  children: React.ReactNode;
}

// Performance utilities
export const withPerformanceOptimization = <T extends object>(Component: React.ComponentType<T>) => {
  return memo(Component);
};

// Optimized image component with lazy loading and proper dimensions
export const OptimizedImage = memo(({ 
  src, 
  alt, 
  width = 200, 
  height = 200, 
  className,
  priority = false 
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}) => {
  return (
    <LazyImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? "eager" : "lazy"}
    />
  );
});

OptimizedImage.displayName = "OptimizedImage";

// Optimized list with virtual scrolling for large datasets
export const OptimizedList = memo(({ 
  items, 
  renderItem, 
  loading = false,
  virtual = true,
  maxHeight = 400
}: {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  loading?: boolean;
  virtual?: boolean;
  maxHeight?: number;
}) => {
  const memoizedRenderItem = useMemo(() => renderItem, [renderItem]);

  if (loading) {
    return <TableSkeleton rows={5} columns={3} />;
  }

  return (
    <MemoizedList
      items={items}
      renderItem={memoizedRenderItem}
      virtual={virtual && items.length > 20}
      maxHeight={maxHeight}
    />
  );
});

OptimizedList.displayName = "OptimizedList";

// Optimized chart wrapper with lazy loading
export const OptimizedChart = memo(({ 
  type, 
  data, 
  config, 
  loading = false,
  height = 300 
}: {
  type: 'pie' | 'bar' | 'line';
  data: any[];
  config: any;
  loading?: boolean;
  height?: number;
}) => {
  if (loading) {
    return <ChartSkeleton />;
  }

  return (
    <Suspense fallback={<ChartSkeleton />}>
      <ConsolidatedChart 
        type={type}
        data={data}
        config={config}
        height={height}
      />
    </Suspense>
  );
});

OptimizedChart.displayName = "OptimizedChart";

// Main performance optimized app wrapper
export const PerformanceOptimizedApp = memo(({ children }: PerformanceOptimizedAppProps) => {
  return (
    <div className="performance-optimized-app">
      <Suspense fallback={<DashboardSkeleton />}>
        {children}
      </Suspense>
    </div>
  );
});

PerformanceOptimizedApp.displayName = "PerformanceOptimizedApp";

// Export all optimized components
export {
  LazyMoodBoard,
  LazyResponsiveDataTable,
  LazyEnhancedDashboardStats,
  DashboardSkeleton,
  CardSkeleton,
  ChartSkeleton,
  TableSkeleton,
};

export default PerformanceOptimizedApp;