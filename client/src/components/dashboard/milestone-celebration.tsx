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

  // Calculate milestone progress - prioritize Emma & Jake's Wedding demo
  const project = projects?.find(p => p.name === "Emma & Jake's Wedding") || projects?.[0];

  const { data: tasks } = useQuery({
    queryKey: ['/api/projects', project?.id, 'tasks'],
    enabled: !!project?.id
  });

  const { data: guests } = useQuery({
    queryKey: ['/api/projects', project?.id, 'guests'],
    enabled: !!project?.id
  });

  const { data: vendors } = useQuery({
    queryKey: ['/api/projects', project?.id, 'vendors'],
    enabled: !!project?.id
  });
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

  // Show simple wedding progress instead of milestone progress
  if (project?.date) {
    const weddingDate = new Date(project.date);
    const today = new Date();
    const timeDiff = weddingDate.getTime() - today.getTime();
    const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
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
          {/* Enhanced countdown with better visual hierarchy */}
          <div className="mb-8">
            {/* Large countdown number with dramatic styling */}
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-blush to-rose rounded-3xl blur-2xl opacity-40 scale-110 animate-pulse" />
              <div className="relative bg-gradient-to-br from-white via-pearl to-cream rounded-3xl p-8 shadow-2xl border-4 border-gradient-to-r from-blush/30 to-rose/30 backdrop-blur-sm">
                <div className="text-7xl md:text-8xl font-bold text-black tracking-tighter">
                  {daysUntil > 0 ? daysUntil : daysUntil === 0 ? "0" : "♾️"}
                </div>
              </div>
              

            </div>
            
            {/* Enhanced subtitle with animation */}
            <div className="space-y-2">
              <p className="text-3xl md:text-4xl font-serif font-light bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700 bg-clip-text text-transparent tracking-wide animate-fade-in">
                {daysUntil > 0 ? "Days Until Forever" : daysUntil === 0 ? "Today's the Day! 🎉" : "Happily Ever After ✨"}
              </p>
              
              {daysUntil > 0 && (
                <div className="flex items-center justify-center space-x-2 text-lg text-gray-600 animate-slide-in-up">
                  <Calendar size={20} className="text-blush" />
                  <span className="font-medium">
                    {daysUntil === 1 ? "Tomorrow!" : 
                     daysUntil <= 7 ? "This week!" :
                     daysUntil <= 30 ? "This month!" :
                     daysUntil <= 365 ? "This year!" : "Coming soon!"}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Enhanced wedding details with stunning design */}
          <div className="space-y-6">
            {/* Wedding name with elegant styling */}
            <div className="relative">
              <h3 className="text-3xl md:text-4xl font-serif font-semibold bg-gradient-to-r from-gray-800 via-blush to-rose bg-clip-text text-transparent mb-3 leading-tight animate-fade-in">
                {project.name}
              </h3>
              
              {/* Decorative line */}
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-blush"></div>
                <div className="text-blush text-xl">💐</div>
                <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-blush"></div>
              </div>
            </div>
            
            {/* Wedding date with enhanced typography */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-lg">
              <p className="text-xl md:text-2xl text-gray-700 font-medium leading-relaxed">
                {weddingDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              
              {project.venue && (
                <div className="flex items-center justify-center space-x-2 mt-4 text-gray-600">
                  <span className="text-blush">📍</span>
                  <span className="font-medium">{project.venue}</span>
                </div>
              )}
              
              {/* Additional countdown insights */}
              {daysUntil > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="font-semibold text-blush">{Math.floor(daysUntil / 7)}</div>
                      <div className="text-gray-500">weeks</div>
                    </div>
                    <div>
                      <div className="font-semibold text-rose">{Math.floor(daysUntil / 30)}</div>
                      <div className="text-gray-500">months</div>
                    </div>
                    <div>
                      <div className="font-semibold text-purple-500">{daysUntil % 7}</div>
                      <div className="text-gray-500">extra days</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          

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