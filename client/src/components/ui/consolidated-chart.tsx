import { memo, Suspense } from "react";
import { ChartSkeleton } from "./skeleton-loader";
import { ChartContainer } from "./chart";
import {
  PieChart,
  BarChart,
  LineChart,
  Pie,
  Bar,
  Line,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

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

interface ChartComponentProps {
  data: any[];
  config: any;
  colors?: string[];
  dataKey?: string;
  height?: number;
}

const PieChartComponent = memo(({ data, config, colors, dataKey, height = 300 }: ChartComponentProps) => (
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
));

const BarChartComponent = memo(({ data, config, colors, dataKey, height = 300 }: ChartComponentProps) => (
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar dataKey={dataKey || "value"} fill={colors?.[0] || "#8884d8"} />
  </BarChart>
));

const LineChartComponent = memo(({ data, config, colors, dataKey, height = 300 }: ChartComponentProps) => (
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Line type="monotone" dataKey={dataKey || "value"} stroke={colors?.[0] || "#8884d8"} />
  </LineChart>
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
      <div className={`flex items-center justify-center ${className || ''}`} style={{ width, height }}>
        <p className="text-neutral-500">No data available</p>
      </div>
    );
  }

  const renderChart = () => {
    const chartProps = { data, config, colors, dataKey, height };
    
    switch (type) {
      case 'pie':
        return <PieChartComponent {...chartProps} />;
      case 'bar':
        return <BarChartComponent {...chartProps} />;
      case 'line':
        return <LineChartComponent {...chartProps} />;
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className={className} style={{ width, height }}>
      <Suspense fallback={<ChartSkeleton />}>
        <ChartContainer config={config}>
          {renderChart()}
        </ChartContainer>
      </Suspense>
      {children}
    </div>
  );
});

ConsolidatedChart.displayName = "ConsolidatedChart";