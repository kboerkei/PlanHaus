import { Heart } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format, differenceInDays } from "date-fns";
import { ThemeToggle } from "@/components/design-system";

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
    <header className="bg-background/95 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50 shadow-sm dark:bg-background/90">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between min-h-[44px]">
          {/* Left: Wedding Name and Date */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <div className="p-1 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 shadow-sm flex-shrink-0">
              <Heart className="h-3 w-3 text-white" fill="currentColor" />
            </div>
            <div className="text-left min-w-0 flex-1">
              <h1 className="text-sm sm:text-lg font-bold text-foreground font-heading truncate">
                {currentProject?.name || 'Your Wedding'}
              </h1>
              {currentProject?.date && (
                <div className="text-xs text-muted-foreground truncate">
                  {format(new Date(currentProject.date), 'MMM d, yyyy')} • {daysUntilWedding > 0 ? `${daysUntilWedding} days to go` : 'Today!'}
                </div>
              )}
            </div>
          </div>
          
          {/* Right: Theme Toggle */}
          <div className="flex-shrink-0 ml-2">
            <ThemeToggle variant="minimal" />
          </div>
        </div>
      </div>
    </header>
  );
}