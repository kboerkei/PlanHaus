import { useState, useEffect } from "react";
import { CheckCircle, ArrowRight, X, Calendar, Users, DollarSign, MapPin, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { WeddingProject } from "@/types";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  completed: boolean;
  action: string;
  href: string;
  priority: number;
}

export default function SmartOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dismissedPermanently, setDismissedPermanently] = useState(false);

  const { data: projects } = useQuery<WeddingProject[]>({
    queryKey: ['/api/projects'],
    enabled: !!localStorage.getItem('sessionId')
  });

  // Prioritize Austin farmhouse wedding demo
  const project = projects?.find((p: any) => p.name === "Emma & Jake's Wedding") || projects?.[0];

  const { data: tasks } = useQuery({
    queryKey: ['/api/projects', project?.id, 'tasks'],
    enabled: !!project?.id
  });

  const { data: guests } = useQuery<any[]>({
    queryKey: ['/api/projects', project?.id, 'guests'],
    enabled: !!project?.id
  });

  // Check if user has dismissed onboarding permanently
  useEffect(() => {
    const dismissed = localStorage.getItem('onboarding_dismissed');
    if (dismissed === 'true') {
      setDismissedPermanently(true);
    }
  }, []);

  // Define onboarding steps
  const steps: OnboardingStep[] = [
    {
      id: 'wedding_date',
      title: 'Set Your Wedding Date',
      description: 'Choose your special day to get a personalized timeline',
      icon: Calendar,
      completed: !!project?.weddingDate,
      action: 'Set Date',
      href: '/profile',
      priority: 1
    },
    {
      id: 'wedding_venue',
      title: 'Add Your Venue',
      description: 'Tell us where you\'re celebrating to get local vendor suggestions',
      icon: MapPin,
      completed: !!project?.venue,
      action: 'Add Venue',
      href: '/profile',
      priority: 2
    },
    {
      id: 'budget',
      title: 'Set Your Budget',
      description: 'Get AI-powered budget breakdowns and expense tracking',
      icon: DollarSign,
      completed: !!project?.budget,
      action: 'Set Budget',
      href: '/budget',
      priority: 3
    },
    {
      id: 'first_guests',
      title: 'Start Your Guest List',
      description: 'Add your first guests to begin RSVP tracking',
      icon: Users,
      completed: (guests?.length || 0) > 0,
      action: 'Add Guests',
      href: '/guests',
      priority: 4
    },
    {
      id: 'wedding_theme',
      title: 'Choose Your Style',
      description: 'Set your wedding theme for personalized inspiration',
      icon: Sparkles,
      completed: !!project?.theme,
      action: 'Set Theme',
      href: '/inspiration',
      priority: 5
    }
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const nextStep = steps.find(step => !step.completed);
  const completionPercentage = Math.round((completedSteps / steps.length) * 100);

  // Show onboarding if user hasn't completed setup and hasn't dismissed it
  useEffect(() => {
    if (!dismissedPermanently && completedSteps < steps.length && project) {
      const timer = setTimeout(() => setShowOnboarding(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [completedSteps, steps.length, project, dismissedPermanently]);

  const handleDismiss = (permanent = false) => {
    setShowOnboarding(false);
    if (permanent) {
      localStorage.setItem('onboarding_dismissed', 'true');
      setDismissedPermanently(true);
    }
  };

  // Don't show if completed, dismissed, or no project
  if (!project || completedSteps === steps.length || dismissedPermanently || !showOnboarding) {
    return null;
  }

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardHeader className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2"
          onClick={() => handleDismiss(false)}
        >
          <X size={16} />
        </Button>
        <CardTitle className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <CheckCircle className="text-white" size={16} />
          </div>
          <span>Complete Your Wedding Setup</span>
        </CardTitle>
        <div className="flex items-center space-x-4">
          <Progress value={completionPercentage} className="flex-1" />
          <span className="text-sm font-medium text-gray-600">
            {completedSteps}/{steps.length} completed
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {nextStep && (
          <div className="bg-white rounded-lg p-4 mb-4 border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <nextStep.icon className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{nextStep.title}</h4>
                <p className="text-sm text-gray-600">{nextStep.description}</p>
              </div>
              <Link href={nextStep.href}>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                  {nextStep.action}
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Progress Overview */}
        <div className="grid grid-cols-5 gap-2">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                  step.completed 
                    ? 'bg-green-100 border border-green-200' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    step.completed 
                      ? 'bg-green-500' 
                      : 'bg-gray-300'
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle className="text-white" size={16} />
                  ) : (
                    <Icon className="text-white" size={16} />
                  )}
                </div>
                <span className="text-xs text-center text-gray-600 leading-tight">
                  {step.title.split(' ').slice(0, 2).join(' ')}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => handleDismiss(true)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Don't show again
          </button>
          <div className="text-sm text-gray-600">
            {completionPercentage}% complete - You're doing great!
          </div>
        </div>
      </CardContent>
    </Card>
  );
}