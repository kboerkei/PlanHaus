import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface KpiCardProps {
  title: string;
  value: string | number;
  delta?: {
    value: number;
    label: string;
    positive: boolean;
  };
  tooltip?: string;
  onClick?: () => void;
}

export function KpiCard({ title, value, delta, tooltip, onClick }: KpiCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `$${(val / 1000000).toFixed(1)}M`;
      }
      if (val >= 1000) {
        return `$${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  const getDeltaIcon = () => {
    if (!delta) return null;
    if (delta.value > 0) return <TrendingUp className="w-3 h-3" />;
    if (delta.value < 0) return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const getDeltaColor = () => {
    if (!delta) return '';
    if (delta.positive) return 'bg-green-100 text-green-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div 
      className={`rounded-2xl border shadow-sm p-4 bg-white ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
      title={tooltip}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-600 mb-1">{title}</p>
          <p className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">
            {formatValue(value)}
          </p>
        </div>
        {delta && (
          <div className={`flex items-center gap-1 text-xs rounded-full px-2 py-0.5 ${getDeltaColor()}`}>
            {getDeltaIcon()}
            <span>{delta.label}</span>
          </div>
        )}
      </div>
    </div>
  );
} 