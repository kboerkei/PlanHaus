import { lazy, Suspense, memo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import LoadingSpinner from '@/components/ui/loading-spinner';

// Import recharts components directly for now to avoid complexity
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BudgetChartData {
  name: string;
  value: number;
  color: string;
}

interface BudgetPieChartProps {
  data: BudgetChartData[];
  title?: string;
  height?: number;
}

const BudgetPieChart = memo(({ data, title, height = 300 }: BudgetPieChartProps) => (
  <ErrorBoundary fallback={<div className="text-red-500">Chart failed to load</div>}>
    <div className="w-full" style={{ height }}>
      {title && <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Amount']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </ErrorBoundary>
));

interface BudgetBarChartProps {
  data: Array<{ category: string; estimated: number; actual: number }>;
  title: string;
  height?: number;
}

const BudgetBarChart = memo(({ data, title, height = 300 }: BudgetBarChartProps) => (
  <ErrorBoundary fallback={<div className="text-red-500">Chart failed to load</div>}>
    <div className="w-full" style={{ height }}>
      <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, '']} />
          <Legend />
          <Bar dataKey="estimated" fill="#8884d8" name="Estimated" />
          <Bar dataKey="actual" fill="#82ca9d" name="Actual" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </ErrorBoundary>
));

export { BudgetPieChart, BudgetBarChart };