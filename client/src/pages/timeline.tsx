import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import LoadingSpinner from "@/components/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, CheckCircle, AlertTriangle } from "lucide-react";

export default function Timeline() {
  // Fetch wedding project data
  const { data: weddingProjects, isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/wedding-projects'],
  });

  // Fetch tasks/timeline data
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/tasks'],
    enabled: !!weddingProjects && weddingProjects.length > 0,
  });

  const currentProject = weddingProjects?.[0];
  const timelineItems = tasks || [];

  const priorityColors = {
    high: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-green-100 text-green-800"
  };

  const getStats = () => {
    const completed = timelineItems.filter((item: any) => item.status === 'completed').length;
    const total = timelineItems.length;
    const pending = timelineItems.filter((item: any) => item.status === 'pending').length;
    const overdue = timelineItems.filter((item: any) => {
      if (!item.dueDate) return false;
      const dueDate = new Date(item.dueDate);
      const today = new Date();
      return dueDate < today && item.status !== 'completed';
    }).length;
    const upcoming = timelineItems.filter((item: any) => {
      if (!item.dueDate) return false;
      const dueDate = new Date(item.dueDate);
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return dueDate >= today && dueDate <= nextWeek && item.status !== 'completed';
    }).length;
    
    return { completed, total, pending, overdue, upcoming };
  };

  const stats = getStats();

  if (projectsLoading || tasksLoading) {
    return (
      <div className="flex min-h-screen bg-cream">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Header />
          <div className="p-6">
            <div className="text-center py-12">
              <LoadingSpinner size="lg" text="Loading your wedding timeline..." />
            </div>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  // Show empty state if no wedding project exists
  if (!currentProject) {
    return (
      <div className="flex min-h-screen bg-cream">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Header />
          <div className="p-6">
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Wedding Project Found</h3>
              <p className="text-gray-600 mb-6">Complete your wedding intake form to start planning your timeline.</p>
              <Button onClick={() => window.location.href = '/intake'} className="gradient-blush-rose text-white">
                Complete Intake Form
              </Button>
            </div>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  // Show empty state if no tasks exist
  if (timelineItems.length === 0) {
    return (
      <div className="flex min-h-screen bg-cream">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Header />
          <div className="p-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="font-serif text-3xl font-semibold text-gray-800 mb-2">
                    Wedding Timeline
                  </h1>
                  <p className="text-gray-600">
                    Stay organized with your wedding planning schedule
                  </p>
                </div>
                <Button className="gradient-blush-rose text-white">
                  <Plus size={16} className="mr-2" />
                  Generate AI Timeline
                </Button>
              </div>

              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Timeline Created Yet</h3>
                <p className="text-gray-600 mb-6">Let our AI assistant create a personalized wedding planning timeline based on your intake form.</p>
                <Button 
                  onClick={() => {
                    // Generate AI timeline
                    if (currentProject?.id) {
                      fetch(`/api/projects/${currentProject.id}/ai/generate-timeline`, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
                        }
                      }).then(() => {
                        window.location.reload();
                      });
                    }
                  }}
                  className="gradient-blush-rose text-white"
                >
                  <Plus size={16} className="mr-2" />
                  Generate AI Timeline
                </Button>
              </div>
            </div>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Header />
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-serif text-3xl font-semibold text-gray-800 mb-2">
                  Wedding Timeline
                </h1>
                <p className="text-gray-600">
                  Stay organized with your wedding planning schedule
                </p>
              </div>
              <Button className="gradient-blush-rose text-white">
                <Plus size={16} className="mr-2" />
                Add Task
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total Tasks</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                  <div className="text-sm text-gray-600">Overdue</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.upcoming}</div>
                  <div className="text-sm text-gray-600">Due Soon</div>
                </CardContent>
              </Card>
            </div>

            {/* Timeline Items */}
            <div className="space-y-6">
              {timelineItems.map((item: any, index: number) => {
                const isCompleted = item.status === 'completed';
                const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && !isCompleted;
                
                return (
                  <div key={item.id} className="relative">
                    {/* Timeline line */}
                    {index < timelineItems.length - 1 && (
                      <div className="absolute left-6 top-16 w-0.5 h-16 bg-gray-200"></div>
                    )}
                    
                    <Card className={`ml-12 ${isCompleted ? 'bg-green-50 border-green-200' : isOverdue ? 'bg-red-50 border-red-200' : ''}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          {/* Timeline dot */}
                          <div className={`absolute -left-6 w-12 h-12 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${
                            isCompleted ? 'bg-green-500' : isOverdue ? 'bg-red-500' : 'bg-blush'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="text-white" size={20} />
                            ) : isOverdue ? (
                              <AlertTriangle className="text-white" size={20} />
                            ) : (
                              <Clock className="text-white" size={20} />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <h3 className="font-semibold text-lg text-gray-800">
                                  {item.title}
                                </h3>
                                {item.priority && (
                                  <Badge className={priorityColors[item.priority as keyof typeof priorityColors]}>
                                    {item.priority}
                                  </Badge>
                                )}
                              </div>
                              {item.dueDate && (
                                <span className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-blush'}`}>
                                  Due: {new Date(item.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            
                            <p className="text-gray-600 mb-4">{item.description}</p>
                            
                            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                {item.category && (
                                  <Badge variant="outline" className="text-xs">
                                    {item.category}
                                  </Badge>
                                )}
                                <span className="text-xs text-gray-500">
                                  Created: {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                {!isCompleted && (
                                  <Button size="sm" variant="outline">
                                    Mark Complete
                                  </Button>
                                )}
                                <Button size="sm" variant="ghost">
                                  Edit
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}