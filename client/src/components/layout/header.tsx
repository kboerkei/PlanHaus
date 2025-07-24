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
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Wedding Name and Date */}
          <div className="flex items-center space-x-3">
            <div className="p-1 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 shadow-sm">
              <Heart className="h-3 w-3 text-white" fill="currentColor" />
            </div>
            <div className="text-left">
              <h1 className="text-lg font-bold text-foreground font-heading">
                {currentProject?.name || 'Your Wedding'}
              </h1>
              {currentProject?.date && (
                <div className="text-xs text-muted-foreground">
                  {format(new Date(currentProject.date), 'MMM d, yyyy')} • {daysUntilWedding > 0 ? `${daysUntilWedding} days to go` : 'Today!'}
                </div>
              )}
            </div>
          </div>
          
          {/* Right: Theme Toggle */}
          <ThemeToggle variant="minimal" />
        </div>
      </div>
    </header>
  );
}