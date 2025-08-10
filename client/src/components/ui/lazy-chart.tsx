import { lazy, Suspense } from "react";
import { ChartContainer } from "@/components/ui/chart";

// Lazy load the chart components
const LazyPieChart = lazy(() => import('recharts').then(module => ({ default: module.PieChart })));
const LazyBarChart = lazy(() => import('recharts').then(module => ({ default: module.BarChart })));
const LazyLineChart = lazy(() => import('recharts').then(module => ({ default: module.LineChart })));
const LazyAreaChart = lazy(() => import('recharts').then(module => ({ default: module.AreaChart })));

interface LazyChartProps {
  type: 'pie' | 'bar' | 'line' | 'area';
  data: any[];
  config: any;
  className?: string;
  children: React.ReactNode;
}

function ChartSkeleton() {
  return (
    <div className="aspect-video w-full animate-pulse bg-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading chart...</div>
    </div>
  );
}

export function LazyChart({ type, data, config, className, children }: LazyChartProps) {
  const renderChart = () => {
    switch (type) {
      case 'pie':
        return (
          <LazyPieChart width={400} height={300} data={data}>
            {children}
          </LazyPieChart>
        );
      case 'bar':
        return (
          <LazyBarChart width={400} height={300} data={data}>
            {children}
          </LazyBarChart>
        );
      case 'line':
        return (
          <LazyLineChart width={400} height={300} data={data}>
            {children}
          </LazyLineChart>
        );
      case 'area':
        return (
          <LazyAreaChart width={400} height={300} data={data}>
            {children}
          </LazyAreaChart>
        );
      default:
        return null;
    }
  };

  return (
    <ChartContainer config={config} className={className}>
      <Suspense fallback={<ChartSkeleton />}>
        {renderChart()}
      </Suspense>
    </ChartContainer>
  );
}