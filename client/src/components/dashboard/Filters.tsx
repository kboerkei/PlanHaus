import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

export interface FiltersProps {
  dateRange: {
    from: string;
    to: string;
  };
  projectId: string;
  segment: string;
  onDateRangeChange: (from: string, to: string) => void;
  onProjectChange: (projectId: string) => void;
  onSegmentChange: (segment: string) => void;
  projects: Array<{
    id: string;
    name: string;
  }>;
  segments: Array<{
    value: string;
    label: string;
  }>;
}

export function Filters({
  dateRange,
  projectId,
  segment,
  onDateRangeChange,
  onProjectChange,
  onSegmentChange,
  projects,
  segments
}: FiltersProps) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Date Range */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => onDateRangeChange(e.target.value, dateRange.to)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="text-slate-500">to</span>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => onDateRangeChange(dateRange.from, e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Project Selector */}
        <div className="relative">
          <select
            value={projectId}
            onChange={(e) => onProjectChange(e.target.value)}
            className="appearance-none text-sm border border-slate-300 rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>

        {/* Segment Toggles */}
        <div className="flex items-center gap-2">
          {segments.map((seg) => (
            <button
              key={seg.value}
              onClick={() => onSegmentChange(seg.value)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                segment === seg.value
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {seg.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 