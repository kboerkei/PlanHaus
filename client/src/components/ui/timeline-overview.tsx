import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ProgressRing from "@/components/ui/progress-ring";
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Target,
  TrendingUp,
  Users,
  DollarSign
} from "lucide-react";

interface TimelineOverviewProps {
  stats: {
    completed: number;
    total: number;
    pending: number;
    overdue: number;
    upcoming: number;
  };
  weddingDate?: string;
  budget?: {
    spent: number;
    total: number;
  };
  guestCount?: number;
  nextMilestone?: {
    title: string;
    date: string;
    progress: number;
  };
}

export default function TimelineOverview({ 
  stats, 
  weddingDate, 
  budget,
  guestCount,
  nextMilestone 
}: TimelineOverviewProps) {
  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  
  const getDaysUntilWedding = () => {
    if (!weddingDate) return null;
    const today = new Date();
    const wedding = new Date(weddingDate);
    const diffTime = wedding.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilWedding = getDaysUntilWedding();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Progress Ring */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Wedding Planning Progress
            <Badge variant={completionRate > 75 ? "default" : completionRate > 50 ? "secondary" : "outline"}>
              {completionRate > 75 ? "On Track" : completionRate > 50 ? "Good Progress" : "Getting Started"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-8">
            <ProgressRing progress={completionRate} size={140}>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-700">
                  {Math.round(completionRate)}%
                </div>
                <div className="text-sm text-gray-500">Complete</div>
              </div>
            </ProgressRing>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-green-500" size={20} />
                <span className="text-sm">{stats.completed} completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="text-blue-500" size={20} />
                <span className="text-sm">{stats.pending} pending</span>
              </div>
              {stats.overdue > 0 && (
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="text-red-500" size={20} />
                  <span className="text-sm text-red-600">{stats.overdue} overdue</span>
                </div>
              )}
              {stats.upcoming > 0 && (
                <div className="flex items-center space-x-2">
                  <Target className="text-orange-500" size={20} />
                  <span className="text-sm">{stats.upcoming} due soon</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wedding Countdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="text-rose-500" size={20} />
            <span>Wedding Day</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          {daysUntilWedding !== null ? (
            <>
              <div className="text-3xl font-bold text-rose-600 mb-2">
                {daysUntilWedding > 0 ? daysUntilWedding : "Today!"}
              </div>
              <div className="text-sm text-gray-600">
                {daysUntilWedding > 0 ? "days to go" : daysUntilWedding === 0 ? "It's your big day!" : "days ago"}
              </div>
              {daysUntilWedding > 0 && daysUntilWedding <= 30 && (
                <Badge variant="secondary" className="mt-2">
                  Final month!
                </Badge>
              )}
            </>
          ) : (
            <div className="text-gray-500">
              <Calendar size={32} className="mx-auto mb-2" />
              <div className="text-sm">Set your wedding date</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="text-blue-500" size={20} />
            <span>Quick Stats</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {budget && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="text-green-500" size={16} />
                <span className="text-sm">Budget Used</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  {Math.round((budget.spent / budget.total) * 100)}%
                </div>
                <div className="text-xs text-gray-500">
                  ${budget.spent.toLocaleString()} / ${budget.total.toLocaleString()}
                </div>
              </div>
            </div>
          )}
          
          {guestCount && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="text-purple-500" size={16} />
                <span className="text-sm">Guest Count</span>
              </div>
              <div className="font-semibold">{guestCount}</div>
            </div>
          )}

          {nextMilestone && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-800 mb-1">
                Next Milestone
              </div>
              <div className="text-xs text-blue-600">
                {nextMilestone.title}
              </div>
              <div className="mt-2">
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${nextMilestone.progress}%` }}
                  />
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  {nextMilestone.progress}% complete
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}