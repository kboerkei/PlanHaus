import React from 'react';
import { useLocation } from 'wouter';
import { format, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns';

export interface MiniCalendarProps {
  dates: Array<{
    date: string;
    label: string;
  }>;
}

export function MiniCalendar({ dates }: MiniCalendarProps) {
  const [, setLocation] = useLocation();

  const handleDateClick = (date: string) => {
    setLocation(`/timeline?date=${date}`);
  };

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    
    return format(date, 'MMM dd');
  };

  const getDateColor = (dateString: string) => {
    const date = parseISO(dateString);
    const today = new Date();
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'text-red-600'; // Past
    if (diffDays <= 7) return 'text-amber-600'; // Soon
    return 'text-slate-600'; // Future
  };

  const sortedDates = dates
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
    .slice(0, 5); // Show only next 5 dates

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Upcoming Dates</h3>
        <button
          onClick={() => setLocation('/timeline')}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          View All
        </button>
      </div>

      <div className="space-y-3">
        {sortedDates.length > 0 ? (
          sortedDates.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
              onClick={() => handleDateClick(item.date)}
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <div>
                  <p className="text-sm font-medium text-slate-900 truncate" title={item.label}>
                    {item.label}
                  </p>
                  <p className={`text-xs ${getDateColor(item.date)}`}>
                    {formatDate(item.date)}
                  </p>
                </div>
              </div>
              <div className="text-xs text-slate-400">
                {format(parseISO(item.date), 'EEE')}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-slate-400 text-sm">No upcoming dates</div>
            <button
              onClick={() => setLocation('/timeline')}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Add important dates
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 