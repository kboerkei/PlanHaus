import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useLocation } from 'wouter';

export interface TaskStatusBarProps {
  segments: Array<{
    label: string;
    value: number;
    color: string;
  }>;
}

export function TaskStatusBar({ segments }: TaskStatusBarProps) {
  const [, setLocation] = useLocation();

  const handleBarClick = (data: any) => {
    if (data && data.label) {
      const filter = data.label.toLowerCase().replace(' ', '-');
      setLocation(`/tasks?filter=${filter}`);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.label}</p>
          <p className="text-sm text-gray-600">
            {data.value} tasks
          </p>
        </div>
      );
    }
    return null;
  };

  const totalTasks = segments.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Task Status</h3>
        <div className="text-sm text-slate-600">
          Total: {totalTasks} tasks
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={segments}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            onClick={handleBarClick}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="label" 
              stroke="#6B7280"
              fontSize={12}
            />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              fill="#8884d8"
              radius={[4, 4, 0, 0]}
            >
              {segments.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-sm text-slate-600">{segment.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 