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
  const currentProject = Array.isArray(projects) 
    ? projects.find((p: any) => p.name === "Emma & Jake's Wedding") || projects[0]
    : null;
  
  // Calculate days until wedding
  const daysUntilWedding = currentProject?.date ? differenceInDays(new Date(currentProject.date), new Date()) : 0;

  return (
    <header className="bg-white/95 backdrop-blur-xl border-b border-gray-100/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="text-center">
          {/* Wedding Header with elegant styling */}
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-2">
            <div className="p-1.5 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 shadow-sm">
              <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-white" fill="currentColor" />
            </div>
            <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-gray-900 font-heading truncate px-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {currentProject?.name || 'Your Wedding'}
            </h1>
            <div className="p-1.5 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 shadow-sm">
              <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-white" fill="currentColor" />
            </div>
          </div>
          
          {/* Wedding date with countdown */}
          {currentProject?.date && (
            <div className="space-y-1">
              <div className="text-sm sm:text-base md:text-lg text-gray-600 font-medium px-2">
                <span className="block sm:inline">{format(new Date(currentProject.date), 'MMMM d, yyyy')}</span>
              </div>
              {daysUntilWedding > 0 && (
                <div className="text-xs sm:text-sm text-rose-500 font-semibold px-2">
                  {daysUntilWedding} days until your special day ✨
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}