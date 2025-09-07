import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useLocation } from 'wouter';
import { format, parseISO } from 'date-fns';

export interface TimelineBurndownProps {
  points: Array<{
    date: string;
    open: number;
    closed: number;
  }>;
  today?: string;
}

export function TimelineBurndown({ points, today }: TimelineBurndownProps) {
  const [, setLocation] = useLocation();

  const handlePointClick = (data: any) => {
    if (data && data.date) {
      setLocation(`/timeline?date=${data.date}`);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = format(parseISO(label), 'MMM dd, yyyy');
      const openTasks = payload.find((p: any) => p.dataKey === 'open')?.value || 0;
      const closedTasks = payload.find((p: any) => p.dataKey === 'closed')?.value || 0;
      
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{date}</p>
          <p className="text-sm text-gray-600">
            Open: {openTasks} | Closed: {closedTasks}
          </p>
        </div>
      );
    }
    return null;
  };

  const formatXAxis = (tickItem: string) => {
    return format(parseISO(tickItem), 'MMM dd');
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Task Timeline</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-slate-600">Open</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-slate-600">Closed</span>
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={points}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            onClick={handlePointClick}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis}
              stroke="#6B7280"
              fontSize={12}
            />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Today's reference line */}
            {today && (
              <ReferenceLine
                x={today}
                stroke="#EF4444"
                strokeDasharray="3 3"
                label={{ value: 'Today', position: 'top', fill: '#EF4444', fontSize: 12 }}
              />
            )}
            
            <Area
              type="monotone"
              dataKey="open"
              stackId="1"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="closed"
              stackId="1"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 