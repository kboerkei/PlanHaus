import { memo, lazy, Suspense } from "react";
import { ChartSkeleton } from "./skeleton-loader";
import { ChartContainer } from "./chart";

// Lazy load chart components to reduce initial bundle size
const PieChart = lazy(() => import('recharts').then(module => ({ default: module.PieChart })));
const BarChart = lazy(() => import('recharts').then(module => ({ default: module.BarChart })));
const LineChart = lazy(() => import('recharts').then(module => ({ default: module.LineChart })));
const Pie = lazy(() => import('recharts').then(module => ({ default: module.Pie })));
const Bar = lazy(() => import('recharts').then(module => ({ default: module.Bar })));
const Line = lazy(() => import('recharts').then(module => ({ default: module.Line })));
const Cell = lazy(() => import('recharts').then(module => ({ default: module.Cell })));
const XAxis = lazy(() => import('recharts').then(module => ({ default: module.XAxis })));
const YAxis = lazy(() => import('recharts').then(module => ({ default: module.YAxis })));
const CartesianGrid = lazy(() => import('recharts').then(module => ({ default: module.CartesianGrid })));
const Tooltip = lazy(() => import('recharts').then(module => ({ default: module.Tooltip })));
const Legend = lazy(() => import('recharts').then(module => ({ default: module.Legend })));
const ResponsiveContainer = lazy(() => import('recharts').then(module => ({ default: module.ResponsiveContainer })));

interface ConsolidatedChartProps {
  type: 'pie' | 'bar' | 'line';
  data: any[];
  config: any;
  width?: number;
  height?: number;
  className?: string;
  colors?: string[];
  dataKey?: string;
  children?: React.ReactNode;
}

const PieChartComponent = memo(({ data, config, colors, dataKey, height = 300 }: any) => (
  <div className="w-full" style={{ height }}>
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          dataKey={dataKey || "value"}
        >
          {data.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={colors?.[index] || entry.color || "#8884d8"} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
));

const BarChartComponent = memo(({ data, config, colors, dataKey, height = 300 }: any) => (
  <div className="w-full" style={{ height }}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={dataKey || "value"} fill={colors?.[0] || "#8884d8"} />
      </BarChart>
    </ResponsiveContainer>
  </div>
));

const LineChartComponent = memo(({ data, config, colors, dataKey, height = 300 }: any) => (
  <div className="w-full" style={{ height }}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey={dataKey || "value"} stroke={colors?.[0] || "#8884d8"} />
      </LineChart>
    </ResponsiveContainer>
  </div>
));

PieChartComponent.displayName = "PieChartComponent";
BarChartComponent.displayName = "BarChartComponent";  
LineChartComponent.displayName = "LineChartComponent";

export const ConsolidatedChart = memo(({ 
  type, 
  data, 
  config, 
  width = 400,
  height = 300, 
  className, 
  colors,
  dataKey,
  children 
}: ConsolidatedChartProps) => {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center text-gray-500" style={{ height }}>
        No data available
      </div>
    );
  }

  const renderChart = () => {
    switch (type) {
      case 'pie':
        return (
          <PieChartComponent 
            data={data} 
            config={config} 
            colors={colors} 
            dataKey={dataKey}
            height={height}
          />
        );
      case 'bar':
        return (
          <BarChartComponent 
            data={data} 
            config={config} 
            colors={colors} 
            dataKey={dataKey}
            height={height}
          />
        );
      case 'line':
        return (
          <LineChartComponent 
            data={data} 
            config={config} 
            colors={colors} 
            dataKey={dataKey}
            height={height}
          />
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
});

ConsolidatedChart.displayName = "ConsolidatedChart";