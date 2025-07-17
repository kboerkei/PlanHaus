import { Heart } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format, differenceInDays } from "date-fns";

export default function Header() {
  const { data: projects } = useQuery({
    queryKey: ['/api/projects'],
    enabled: !!localStorage.getItem('sessionId')
  });

  // Get the current project (prioritizing Austin farmhouse wedding demo)
  const currentProject = projects?.find(p => p.name === "Emma & Jake's Wedding") || projects?.[0];
  
  // Calculate days until wedding
  const daysUntilWedding = currentProject?.date ? differenceInDays(new Date(currentProject.date), new Date()) : 0;

  return (
    <header className="bg-white border-b border-gray-50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="text-center">
          {/* Wedding Header styled like your image */}
          <div className="flex items-center justify-center space-x-1 sm:space-x-2 mb-1">
            <Heart className="h-4 w-4 sm:h-6 sm:w-6 text-rose-500" fill="currentColor" />
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 font-serif truncate px-2">
              {currentProject?.name || 'Your Wedding'}
            </h1>
            <Heart className="h-4 w-4 sm:h-6 sm:w-6 text-rose-500" fill="currentColor" />
          </div>
          
          {/* Wedding date and countdown */}
          {currentProject?.date && (
            <div className="text-xs sm:text-sm md:text-base text-gray-600 px-2">
              <span className="block sm:inline">{format(new Date(currentProject.date), 'MMMM d, yyyy')}</span>
              {daysUntilWedding > 0 && (
                <span className="block sm:inline sm:ml-2 text-rose-600 font-semibold">
                  <span className="hidden sm:inline">• </span>{daysUntilWedding} days to go!
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}