import React from 'react';
import { useLocation } from 'wouter';

export interface VendorFunnelProps {
  stages: Array<{
    label: string;
    value: number;
    color: string;
  }>;
}

export function VendorFunnel({ stages }: VendorFunnelProps) {
  const [, setLocation] = useLocation();

  const handleStageClick = (stageLabel: string) => {
    const stage = stageLabel.toLowerCase();
    setLocation(`/vendors?stage=${stage}`);
  };

  const maxValue = Math.max(...stages.map(s => s.value));

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Vendor Pipeline</h3>
        <div className="text-sm text-slate-600">
          Total: {stages.reduce((sum, stage) => sum + stage.value, 0)} vendors
        </div>
      </div>

      <div className="space-y-4">
        {stages.map((stage, index) => {
          const percentage = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
          const width = Math.max(20, percentage); // Minimum 20% width
          
          return (
            <div key={stage.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{stage.label}</span>
                <span className="text-sm text-slate-600">{stage.value}</span>
              </div>
              <div 
                className="relative h-8 bg-slate-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleStageClick(stage.label)}
                title={`Click to view ${stage.label.toLowerCase()} vendors`}
              >
                <div
                  className="h-full rounded-lg transition-all duration-300 ease-out"
                  style={{
                    width: `${width}%`,
                    backgroundColor: stage.color
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium text-white drop-shadow-sm">
                    {stage.value > 0 ? stage.value : ''}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Conversion rates */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <h4 className="text-sm font-medium text-slate-900 mb-3">Conversion Rates</h4>
        <div className="space-y-2">
          {stages.slice(0, -1).map((stage, index) => {
            const nextStage = stages[index + 1];
            const conversionRate = stage.value > 0 ? (nextStage.value / stage.value) * 100 : 0;
            
            return (
              <div key={`conversion-${index}`} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">
                  {stage.label} → {nextStage.label}
                </span>
                <span className="font-medium text-slate-900">
                  {conversionRate.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 