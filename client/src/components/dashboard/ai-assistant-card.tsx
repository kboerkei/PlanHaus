import { Bot, Star, Sparkles, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useState, useEffect } from "react";

export default function AIAssistantCard() {
  const [currentTip, setCurrentTip] = useState(0);

  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ['/api/projects'],
    enabled: !!localStorage.getItem('sessionId')
  });

  const { data: tasks = [] } = useQuery<any[]>({
    queryKey: ['/api/projects', projects[0]?.id, 'tasks'],
    enabled: !!projects[0]?.id
  });

  const project = projects?.[0];
  const urgentTasks = tasks?.filter(t => t.priority === 'high' && t.status !== 'completed') || [];
  const completedTasks = tasks?.filter(t => t.status === 'completed') || [];

  // Smart tips based on project data
  const smartTips = [
    {
      text: project?.theme ? 
        `Your ${project.theme} theme is perfect for the season! Consider booking vendors who specialize in this style early.` :
        "Set your wedding theme to get personalized vendor recommendations and styling tips.",
      icon: Sparkles,
      hasData: !!project?.theme
    },
    {
      text: urgentTasks.length > 0 ? 
        `You have ${urgentTasks.length} high-priority task${urgentTasks.length > 1 ? 's' : ''} coming up. Want me to help prioritize them?` :
        completedTasks.length > 0 ? 
        `Great progress! You've completed ${completedTasks.length} tasks. Let's tackle the next milestone.` :
        "Start by adding your most important wedding tasks to stay organized.",
      icon: Clock,
      hasData: urgentTasks.length > 0 || completedTasks.length > 0
    },
    {
      text: project?.budget ? 
        `Based on your $${project.budget} budget, I can suggest optimal vendor allocations and money-saving tips.` :
        "Set your wedding budget to get AI-powered cost breakdowns and vendor recommendations.",
      icon: TrendingUp,
      hasData: !!project?.budget
    }
  ];

  // Rotate tips every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % smartTips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [smartTips.length]);

  const currentTipData = smartTips[currentTip];
  const TipIcon = currentTipData.icon;

  return (
    <div className="lg:col-span-2">
      <div className="gradient-blush-rose rounded-2xl shadow-sm p-6 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4">
            <div className="w-32 h-32 border border-white rounded-full opacity-20"></div>
          </div>
          <div className="absolute bottom-4 left-4">
            <div className="w-20 h-20 border border-white rounded-full opacity-20"></div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="font-serif text-xl font-semibold">AI Planning Assistant</h3>
                <p className="text-white text-opacity-90">Powered by GPT-4o</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-white text-opacity-75">Active 24/7</div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                <span className="text-xs text-white text-opacity-90">Online</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white bg-opacity-15 rounded-xl p-4 mb-4 backdrop-blur-sm">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
                <TipIcon size={16} />
              </div>
              <div className="flex-1">
                <p className="text-white text-opacity-95 text-sm leading-relaxed">
                  {currentTipData.text}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex space-x-1">
                {smartTips.map((tip, index) => (
                  <div 
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentTip ? 'bg-white' : 'bg-white bg-opacity-40'
                    }`}
                  />
                ))}
              </div>
              <span className="text-white text-opacity-75 text-xs">
                AI Insights • {currentTip + 1}/{smartTips.length}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Link href="/ai-assistant" className="flex-1">
              <Button 
                className="w-full bg-white text-rose-gold font-semibold hover:bg-gray-50 border-0"
                size="lg"
              >
                Chat with AI
              </Button>
            </Link>
            {!currentTipData.hasData && (
              <Link href="/profile">
                <Button 
                  variant="outline"
                  className="bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-30"
                  size="lg"
                >
                  Setup
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
