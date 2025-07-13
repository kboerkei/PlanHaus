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
      id: 'venue_milestone',
      title: 'Major Venue Progress',
      description: 'Complete venue-related planning tasks',
      icon: Calendar,
      progress: completedTasks.filter(t => t.title.toLowerCase().includes('venue')).length,
      completed: completedTasks.filter(t => t.title.toLowerCase().includes('venue')).length >= 1,
      celebrationMessage: "Fantastic! Your venue planning is moving forward. The foundation of your special day is taking shape!"
    },
    {
      id: 'first_vendor',
      title: 'Dream Team Building',
      description: 'Book your first wedding vendor',
      icon: Heart,
      progress: bookedVendors.length,
      completed: bookedVendors.length >= 1,
      celebrationMessage: "Your wedding dream team is coming together! First vendor secured and many more exciting partnerships ahead!"
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

  // Show next milestone progress
  if (nextMilestone && tasks && guests && vendors) {
    const Icon = nextMilestone.icon;
    const progressPercent = Math.min(100, (nextMilestone.progress / getProgressTarget(nextMilestone.id)) * 100);
    
    return (
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
              <Icon className="text-white" size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">{nextMilestone.title}</h4>
              <p className="text-sm text-gray-600">{nextMilestone.description}</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {nextMilestone.progress} / {getProgressTarget(nextMilestone.id)} completed
              </p>
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
    case 'venue_milestone': return 1;
    case 'first_vendor': return 1;
    case 'guest_responses': return 5;
    default: return 1;
  }
}