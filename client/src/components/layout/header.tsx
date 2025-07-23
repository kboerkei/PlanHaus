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
    <header className="bg-background/95 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50 shadow-sm dark:bg-background/90 min-h-[120px]">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="relative min-h-[80px] flex flex-col justify-center">
          {/* Theme Toggle - positioned absolutely top-right */}
          <div className="absolute top-0 right-0">
            <ThemeToggle variant="minimal" />
          </div>
          
          <div className="text-center space-y-3">
            {/* Wedding Header with elegant styling */}
            <div className="flex items-center justify-center space-x-2 sm:space-x-3">
              <div className="p-1.5 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 shadow-sm">
                <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-white" fill="currentColor" />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground font-heading px-2">
                {currentProject?.name || 'Your Wedding'}
              </h1>
              <div className="p-1.5 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 shadow-sm">
                <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-white" fill="currentColor" />
              </div>
            </div>
            
            {/* Wedding date with detailed countdown */}
            {currentProject?.date && (
              <div className="space-y-2">
                <div className="text-base sm:text-lg md:text-xl text-foreground font-medium">
                  {format(new Date(currentProject.date), 'EEEE, MMMM d, yyyy')}
                </div>
                <div className="text-sm text-muted-foreground">
                  📍 {currentProject.location || 'Sunset Ranch Austin'}
                </div>
                <div className="text-sm italic text-muted-foreground">
                  "The adventure begins..."
                </div>
                {daysUntilWedding > 0 && (
                  <div className="flex justify-center gap-4 mt-3">
                    {(() => {
                      const months = Math.floor(daysUntilWedding / 30);
                      const weeks = Math.floor((daysUntilWedding % 30) / 7);
                      const days = daysUntilWedding % 7;
                      
                      return (
                        <>
                          {months > 0 && (
                            <div className="text-center bg-rose-50 dark:bg-rose-950/20 px-3 py-2 rounded-lg border border-rose-200 dark:border-rose-800">
                              <div className="text-lg font-bold text-rose-600 dark:text-rose-400">{months}</div>
                              <div className="text-xs text-rose-500 dark:text-rose-400">months</div>
                            </div>
                          )}
                          {weeks > 0 && (
                            <div className="text-center bg-rose-50 dark:bg-rose-950/20 px-3 py-2 rounded-lg border border-rose-200 dark:border-rose-800">
                              <div className="text-lg font-bold text-rose-600 dark:text-rose-400">{weeks}</div>
                              <div className="text-xs text-rose-500 dark:text-rose-400">weeks</div>
                            </div>
                          )}
                          <div className="text-center bg-rose-50 dark:bg-rose-950/20 px-3 py-2 rounded-lg border border-rose-200 dark:border-rose-800">
                            <div className="text-lg font-bold text-rose-600 dark:text-rose-400">{days}</div>
                            <div className="text-xs text-rose-500 dark:text-rose-400">days</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}