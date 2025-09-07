import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useLocation } from 'wouter';

export interface BudgetDonutProps {
  spent: number;
  remaining: number;
  categories: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export function BudgetDonut({ spent, remaining, categories }: BudgetDonutProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [, setLocation] = useLocation();

  // Prepare data for the donut chart
  const donutData = [
    { name: 'Spent', value: spent, color: '#EF4444' },
    { name: 'Remaining', value: remaining, color: '#E5E7EB' }
  ];

  const total = spent + remaining;
  const spentPercentage = total > 0 ? (spent / total) * 100 : 0;

  const handleCategoryClick = (categoryName: string) => {
    setLocation(`/budget?category=${encodeURIComponent(categoryName)}`);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            ${data.value.toLocaleString()}
            {data.name === 'Spent' && (
              <span className="ml-2">({spentPercentage.toFixed(1)}%)</span>
            )}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Budget Overview</h3>
        <div className="text-sm text-slate-600">
          Total: ${total.toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">
                {spentPercentage.toFixed(0)}%
              </div>
              <div className="text-sm text-slate-600">Spent</div>
            </div>
          </div>
        </div>

        {/* Category Legend */}
        <div className="space-y-3">
          <h4 className="font-medium text-slate-900">By Category</h4>
          <div className="space-y-2">
            {categories.map((category, index) => (
              <div
                key={category.name}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => handleCategoryClick(category.name)}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm text-slate-700 truncate" title={category.name}>
                    {category.name}
                  </span>
                </div>
                <span className="text-sm font-medium text-slate-900">
                  ${category.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 