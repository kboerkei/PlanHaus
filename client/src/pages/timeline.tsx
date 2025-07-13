import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import LoadingSpinner from "@/components/loading-spinner";
import TimelineOverview from "@/components/ui/timeline-overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Plus, CheckCircle, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export default function Timeline() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch wedding project data
  const { data: weddingProjects, isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/wedding-projects'],
  });

  // Fetch tasks/timeline data
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/tasks'],
  });

  // Fetch dashboard stats for enhanced overview
  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
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

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      priority: "medium",
      dueDate: "",
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: TaskFormData) => apiRequest('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Success",
        description: "Timeline task added successfully",
      });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add timeline task",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: TaskFormData) => {
    createTaskMutation.mutate(data);
  };

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

  // Show empty state if no tasks exist or data is null
  if (!timelineItems || timelineItems.length === 0) {
    return (
      <div className="flex min-h-screen bg-cream">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Header />
          <div className="p-6">
            <div className="max-w-6xl mx-auto">

              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Timeline Created Yet</h3>
                <p className="text-gray-600 mb-6">Let our AI assistant create a personalized wedding planning timeline based on your intake form.</p>
                <Button 
                  onClick={async () => {
                    try {
                      const sessionId = localStorage.getItem('sessionId');
                      if (!sessionId) {
                        alert('Please log in to generate timeline');
                        return;
                      }
                      
                      alert('AI timeline generation is temporarily unavailable due to API quota limits. You can add tasks manually using the "Add Task" button.');
                      return;
                      
                      // Generate AI timeline by making a request to the general timeline endpoint
                      const response = await fetch('/api/ai/generate-timeline', {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${sessionId}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          weddingDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                          budget: 50000,
                          guestCount: 100,
                          venue: 'TBD',
                          theme: 'Classic'
                        })
                      });
                      
                      if (response.ok) {
                        window.location.reload();
                      } else {
                        console.error('Failed to generate timeline');
                        alert('Failed to generate timeline. Please try again.');
                      }
                    } catch (error) {
                      console.error('Error generating timeline:', error);
                      alert('Error generating timeline. Please try again.');
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

            {/* Add Task Dialog */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-serif text-2xl font-semibold text-gray-800 mb-1">
                  Wedding Timeline
                </h1>
                <p className="text-gray-600">
                  Stay organized with your wedding planning schedule
                </p>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-blush-rose text-white">
                    <Plus size={16} className="mr-2" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Timeline Task</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Task Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Book wedding venue" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Task details..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Venue, Photography, Catering" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Due Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createTaskMutation.isPending} className="gradient-blush-rose text-white">
                          {createTaskMutation.isPending ? "Adding..." : "Add Task"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
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
              {timelineItems
                .sort((a: any, b: any) => {
                  // Sort by due date if available, otherwise by creation date
                  const dateA = a.dueDate ? new Date(a.dueDate) : new Date(a.createdAt);
                  const dateB = b.dueDate ? new Date(b.dueDate) : new Date(b.createdAt);
                  return dateA.getTime() - dateB.getTime();
                })
                .map((item: any, index: number) => {
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
                          
                          {/* Completion checkbox */}
                          <div className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              checked={isCompleted}
                              onChange={() => {
                                // Toggle completion status
                                const updateData = { 
                                  status: isCompleted ? 'pending' : 'completed',
                                  completedAt: isCompleted ? null : new Date().toISOString()
                                };
                                
                                fetch(`/api/tasks/${item.id}`, {
                                  method: 'PATCH',
                                  headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
                                    'Content-Type': 'application/json'
                                  },
                                  body: JSON.stringify(updateData)
                                }).then(() => {
                                  queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
                                });
                              }}
                              className="w-5 h-5 text-green-600 rounded focus:ring-green-500 mt-1"
                            />
                          
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                  <h3 className={`font-semibold text-lg ${isCompleted ? 'text-green-700 line-through' : 'text-gray-800'}`}>
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
                              
                              <p className={`text-gray-600 mb-4 ${isCompleted ? 'line-through' : ''}`}>{item.description}</p>
                              
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
                                  {isCompleted && item.completedAt && (
                                    <span className="text-xs text-green-600">
                                      Completed: {new Date(item.completedAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Button size="sm" variant="ghost">
                                    Edit
                                  </Button>
                                </div>
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
            
            {/* Timeline Visual Guide */}
            {timelineItems.length > 0 && (
              <div className="mt-12 p-6 bg-white rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Timeline Overview</h3>
                <div className="space-y-2">
                  {timelineItems
                    .filter((item: any) => item.dueDate)
                    .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                    .map((item: any) => {
                      const dueDate = new Date(item.dueDate);
                      const isCompleted = item.status === 'completed';
                      const isOverdue = dueDate < new Date() && !isCompleted;
                      const daysUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <div key={item.id} className="flex items-center justify-between py-2 px-4 rounded-lg bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              isCompleted ? 'bg-green-500' : isOverdue ? 'bg-red-500' : 'bg-blush'
                            }`}></div>
                            <span className={`font-medium ${isCompleted ? 'text-green-700 line-through' : 'text-gray-800'}`}>
                              {item.title}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {dueDate.toLocaleDateString()} 
                            {!isCompleted && (
                              <span className={`ml-2 ${isOverdue ? 'text-red-600' : daysUntilDue <= 7 ? 'text-orange-600' : 'text-gray-500'}`}>
                                ({isOverdue ? `${Math.abs(daysUntilDue)} days overdue` : 
                                  daysUntilDue === 0 ? 'Due today' : 
                                  daysUntilDue === 1 ? 'Due tomorrow' : 
                                  `${daysUntilDue} days left`})
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}