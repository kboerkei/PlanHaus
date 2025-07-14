import { useState, useEffect } from "react";
import { Party, X, Star, Heart, Calendar, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: any;
  progress: number;
  completed: boolean;
  celebrationMessage: string;
}

export default function MilestoneCelebration() {
  const [showCelebration, setShowCelebration] = useState(false);
  const [completedMilestone, setCompletedMilestone] = useState<Milestone | null>(null);

  const { data: projects } = useQuery({
    queryKey: ['/api/projects'],
    enabled: !!localStorage.getItem('sessionId')
  });

  const { data: tasks } = useQuery({
    queryKey: ['/api/projects', projects?.[0]?.id, 'tasks'],
    enabled: !!projects?.[0]?.id
  });

  const { data: guests } = useQuery({
    queryKey: ['/api/projects', projects?.[0]?.id, 'guests'],
    enabled: !!projects?.[0]?.id
  });

  const { data: vendors } = useQuery({
    queryKey: ['/api/projects', projects?.[0]?.id, 'vendors'],
    enabled: !!projects?.[0]?.id
  });

  // Calculate milestone progress
  const project = projects?.[0];
  const completedTasks = tasks?.filter(t => t.status === 'completed') || [];
  const confirmedGuests = guests?.filter(g => g.rsvpStatus === 'confirmed') || [];
  const bookedVendors = vendors?.filter(v => v.status === 'booked') || [];

  const milestones: Milestone[] = [
    {
      id: 'intake_complete',
      title: 'Wedding Planning Started!',
      description: 'You completed your wedding intake and timeline setup',
      icon: Star,
      progress: project ? 1 : 0,
      completed: !!project && !!project.date,
      celebrationMessage: "Congratulations! Your wedding planning timeline is ready. Let's make your dream wedding happen!"
    },
    {
      id: 'guest_responses',
      title: 'Guest List Success',
      description: 'Get your first guest RSVPs',
      icon: Gift,
      progress: confirmedGuests.length,
      completed: confirmedGuests.length >= 5,
      celebrationMessage: "The celebration is taking shape! Your guests are excited to join your special day!"
    }
  ];

  // Check for newly completed milestones
  useEffect(() => {
    const checkMilestones = () => {
      const newlyCompleted = milestones.find(milestone => {
        const wasCompleted = localStorage.getItem(`milestone_${milestone.id}`) === 'true';
        return milestone.completed && !wasCompleted;
      });

      if (newlyCompleted) {
        setCompletedMilestone(newlyCompleted);
        setShowCelebration(true);
        localStorage.setItem(`milestone_${newlyCompleted.id}`, 'true');
      }
    };

    checkMilestones();
  }, [tasks, guests, vendors]);

  const nextMilestone = milestones.find(m => !m.completed);

  if (showCelebration && completedMilestone) {
    const Icon = completedMilestone.icon;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 relative overflow-hidden">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 z-10"
            onClick={() => setShowCelebration(false)}
          >
            <X size={16} />
          </Button>
          
          <CardContent className="text-center p-8">
            {/* Confetti Animation */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>

            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon className="text-white" size={32} />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Milestone Achieved!
              </h3>
              
              <h4 className="text-xl font-semibold text-pink-600 mb-3">
                {completedMilestone.title}
              </h4>
              
              <p className="text-gray-600 mb-6">
                {completedMilestone.celebrationMessage}
              </p>
              
              <Button
                onClick={() => setShowCelebration(false)}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
              >
                Continue Planning
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show wedding countdown instead of milestone progress
  if (project?.date) {
    const weddingDate = new Date(project.date);
    const today = new Date();
    const timeDiff = weddingDate.getTime() - today.getTime();
    const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    // Calculate time breakdown
    const months = Math.floor(daysUntil / 30);
    const weeks = Math.floor((daysUntil % 30) / 7);
    const days = daysUntil % 7;
    
    return (
      <Card className="mb-8 overflow-hidden relative border-0 shadow-2xl">
        {/* Enhanced background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-pearl via-cream to-blush/20" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-rose/5 to-transparent" />
        
        {/* Floating decorative elements */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-blush/30 to-rose/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-purple/20 to-blush/30 rounded-full blur-2xl animate-float" />
        <div className="absolute top-10 right-20 w-8 h-8 bg-blush/40 rounded-full animate-ping" />
        <div className="absolute bottom-20 left-16 w-4 h-4 bg-rose/60 rounded-full animate-pulse delay-1000" />
        <div className="absolute top-1/3 left-1/4 w-6 h-6 bg-purple/30 rounded-full animate-bounce delay-500" />
        
        {/* Sparkling effects */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-blush to-rose rounded-full animate-ping opacity-70"
            style={{
              left: `${10 + (i * 8)}%`,
              top: `${15 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: '2s'
            }}
          />
        ))}
        
        <CardContent className="relative p-12 text-center">
          {/* Enhanced heart icon */}
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-br from-blush to-rose rounded-full blur-xl opacity-60 animate-pulse" />
              <div className="relative w-28 h-28 bg-gradient-to-br from-blush via-rose to-purple rounded-full flex items-center justify-center shadow-2xl border-4 border-white/50 backdrop-blur-sm">
                <Heart className="text-white drop-shadow-lg animate-pulse" size={40} />
              </div>
              {/* Floating hearts */}
              <div className="absolute -top-2 -right-2 text-blush animate-bounce delay-300">💖</div>
              <div className="absolute -bottom-2 -left-2 text-rose animate-bounce delay-700">💕</div>
            </div>
          </div>
          
          {/* Enhanced title with gradient text */}
          <div className="mb-6">
            <h2 className="text-5xl sm:text-6xl font-serif font-bold bg-gradient-to-r from-gray-800 via-blush to-rose bg-clip-text text-transparent mb-3 leading-tight">
              {daysUntil > 0 ? `${daysUntil}` : daysUntil === 0 ? "0" : "∞"}
            </h2>
            <p className="text-2xl font-serif text-gray-700 mb-2">
              {daysUntil > 0 ? "Days Until Forever" : daysUntil === 0 ? "Today's the Day!" : "Happily Ever After"}
            </p>
          </div>
          
          {/* Wedding details with enhanced styling */}
          <div className="mb-8">
            <h3 className="text-2xl font-serif font-semibold text-gray-800 mb-2">{project.name}</h3>
            <p className="text-lg text-gray-600 font-medium">
              {weddingDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          {/* Enhanced countdown grid */}
          {daysUntil > 0 && (
            <div className="relative">
              <div className="absolute inset-0 bg-white/40 backdrop-blur-md rounded-2xl border border-white/30 shadow-inner" />
              <div className="relative p-8">
                <div className="grid grid-cols-4 gap-6">
                  <div className="group">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blush/20 to-rose/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40 hover:border-blush/40 transition-all duration-300 hover:scale-105">
                        <div className="text-3xl font-bold text-gray-800 mb-1">{months}</div>
                        <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">Months</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-rose/20 to-purple/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40 hover:border-rose/40 transition-all duration-300 hover:scale-105">
                        <div className="text-3xl font-bold text-gray-800 mb-1">{weeks}</div>
                        <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">Weeks</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple/20 to-blush/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40 hover:border-purple/40 transition-all duration-300 hover:scale-105">
                        <div className="text-3xl font-bold text-gray-800 mb-1">{days}</div>
                        <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">Days</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blush/30 to-rose/40 rounded-xl blur opacity-50 group-hover:opacity-80 transition-opacity duration-300" />
                      <div className="relative bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40 hover:border-blush/50 transition-all duration-300 hover:scale-105">
                        <div className="text-3xl font-bold text-blush mb-1 animate-pulse">∞</div>
                        <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">Forever</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-8 pt-6 border-t border-white/30">
                  <div className="text-sm font-medium text-gray-600 mb-2 uppercase tracking-wide">Wedding Journey</div>
                  <div className="w-full bg-white/40 rounded-full h-3 shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-blush via-rose to-purple h-3 rounded-full transition-all duration-1000 shadow-sm"
                      style={{ width: `${Math.min(100, ((365 - daysUntil) / 365) * 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-2 font-medium">
                    {Math.round(((365 - daysUntil) / 365) * 100)}% of your planning journey complete
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}

function getProgressTarget(milestoneId: string): number {
  switch (milestoneId) {
    case 'intake_complete': return 1;
    case 'guest_responses': return 5;
    default: return 1;
  }
}