import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import LoadingSpinner from "@/components/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar, Plus, CheckCircle2, Clock, AlertTriangle, CalendarDays, Target, Users, TrendingUp 
} from "lucide-react";
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

const priorityColors = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800"
};

const taskCategories = [
  "Venue", "Catering", "Photography", "Flowers", "Music", "Transportation", 
  "Attire", "Invitations", "Decorations", "Beauty", "Legal", "Other"
];

// Enhanced Task Card Component
function TaskCard({ task, onToggle, onEdit }: { task: any; onToggle: (task: any) => void; onEdit: (task: any) => void }) {
  const dueDateInfo = getDaysUntilDue(task?.dueDate);
  
  return (
    <div 
      className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 group cursor-pointer"
      onClick={() => onEdit(task)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(task);
            }}
            className={`p-2 rounded-full transition-all duration-200 ${
              task?.status === 'completed' 
                ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                : 'text-gray-400 hover:text-green-500 hover:bg-green-50'
            }`}
          >
            <CheckCircle2 size={20} />
          </Button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className={`font-semibold text-lg leading-tight ${
                task?.status === 'completed' 
                  ? 'line-through text-gray-500' 
                  : 'text-gray-900 group-hover:text-blue-600'
              }`}>
                {task?.title || 'Untitled Task'}
              </h4>
              {dueDateInfo.urgent && (
                <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
              )}
            </div>
            
            {task?.description && (
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                {task.description}
              </p>
            )}
            
            <div className="flex items-center flex-wrap gap-2">
              {task?.priority && (
                <Badge className={`${priorityColors[task.priority as keyof typeof priorityColors]} font-medium`}>
                  {task.priority}
                </Badge>
              )}
              {task?.category && (
                <Badge variant="outline" className="text-xs border-gray-300">
                  {task.category}
                </Badge>
              )}
              {task?.dueDate && (
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${dueDateInfo.color} flex items-center space-x-1`}>
                  <Clock size={12} />
                  <span>{dueDateInfo.text}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Function to calculate days until due date
const getDaysUntilDue = (dueDate: string | null): { text: string; color: string; urgent: boolean } => {
  if (!dueDate) return { text: "", color: "", urgent: false };
  
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { 
      text: `${Math.abs(diffDays)} days overdue`, 
      color: "text-red-600 bg-red-50", 
      urgent: true 
    };
  } else if (diffDays === 0) {
    return { 
      text: "Due today", 
      color: "text-orange-600 bg-orange-50", 
      urgent: true 
    };
  } else if (diffDays === 1) {
    return { 
      text: "Due tomorrow", 
      color: "text-orange-600 bg-orange-50", 
      urgent: true 
    };
  } else if (diffDays <= 7) {
    return { 
      text: `Due in ${diffDays} days`, 
      color: "text-yellow-600 bg-yellow-50", 
      urgent: false 
    };
  } else {
    return { 
      text: `Due in ${diffDays} days`, 
      color: "text-gray-600 bg-gray-50", 
      urgent: false 
    };
  }
};

export default function TimelineSimple() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const { toast } = useToast();

  // Fetch data with proper error handling
  const { data: weddingProjects, isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/wedding-projects'],
  });

  const { data: tasks, isLoading: tasksLoading, error: tasksError } = useQuery({
    queryKey: ['/api/tasks'],
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  // Form setup
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

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: (data: TaskFormData) => apiRequest('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task Created",
        description: "New task added successfully",
      });
      form.reset();
      setIsAddDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create task",
        variant: "destructive",
      });
    }
  });

  const toggleTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest(`/api/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task Updated",
        description: "Task status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update task",
        variant: "destructive",
      });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TaskFormData }) =>
      apiRequest(`/api/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task Updated",
        description: "Task details updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingTask(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update task",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: TaskFormData) => {
    // Convert form data to match the API schema
    const taskData = {
      title: data.title,
      description: data.description || null,
      category: data.category || null,
      priority: data.priority || 'medium',
      dueDate: data.dueDate || null,
    };
    createTaskMutation.mutate(taskData);
  };

  const handleToggleComplete = (task: any) => {
    const newStatus = task?.status === 'completed' ? 'pending' : 'completed';
    toggleTaskMutation.mutate({ 
      id: task?.id, 
      data: { status: newStatus } 
    });
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    form.reset({
      title: task.title || "",
      description: task.description || "",
      category: task.category || "",
      priority: task.priority || "medium",
      dueDate: task.dueDate || "",
    });
    setIsEditDialogOpen(true);
  };

  const onEditSubmit = (data: TaskFormData) => {
    if (!editingTask) return;
    const taskData = {
      title: data.title,
      description: data.description || null,
      category: data.category || null,
      priority: data.priority || 'medium',
      dueDate: data.dueDate || null,
    };
    updateTaskMutation.mutate({ id: editingTask.id, data: taskData });
  };

  // Safe data access
  const safeWeddingProjects = weddingProjects || [];
  const safeTasks = tasks || [];
  // Prioritize Austin farmhouse wedding demo
  const currentProject = safeWeddingProjects.find(p => p.name === "Emma & Jake's Wedding") || safeWeddingProjects[0];
  
  // Function to group tasks by timeline milestones
  const groupTasksByMilestone = (tasks: any[]) => {
    const today = new Date();
    const weddingDate = currentProject?.date ? new Date(currentProject.date) : null;
    
    const groups = {
      overdue: [] as any[],
      thisWeek: [] as any[],
      thisMonth: [] as any[],
      next3Months: [] as any[],
      beforeWedding: [] as any[],
      noDueDate: [] as any[],
      completed: [] as any[]
    };

    // Sort tasks by due date first
    const sortedTasks = [...tasks].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    sortedTasks.forEach(task => {
      // First check if task is completed - if so, put it in completed section
      if (task.status === 'completed') {
        groups.completed.push(task);
        return;
      }

      // Only organize pending tasks by timeline
      if (!task.dueDate) {
        groups.noDueDate.push(task);
        return;
      }

      const dueDate = new Date(task.dueDate);
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        groups.overdue.push(task);
      } else if (diffDays <= 7) {
        groups.thisWeek.push(task);
      } else if (diffDays <= 30) {
        groups.thisMonth.push(task);
      } else if (diffDays <= 90) {
        groups.next3Months.push(task);
      } else {
        groups.beforeWedding.push(task);
      }
    });

    return groups;
  };

  const taskGroups = groupTasksByMilestone(safeTasks);
  
  // Safe stats calculation
  const getSimpleStats = () => {
    const total = safeTasks.length;
    const completed = safeTasks.filter((task: any) => task?.status === 'completed').length;
    const pending = safeTasks.filter((task: any) => task?.status === 'pending').length;
    const overdue = taskGroups.overdue.length;
    return { total, completed, pending, overdue };
  };

  const stats = getSimpleStats();
  const completionPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  if (tasksLoading || projectsLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (tasksError) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-16">
            <Calendar className="h-20 w-20 text-blush mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Welcome to Your Wedding Timeline</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Plan your perfect wedding with our intelligent task management system. 
              Stay organized and never miss a milestone.
            </p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="gradient-blush-rose text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              size="lg"
            >
              <Plus className="mr-2" size={20} />
              Create Your First Task
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="relative mb-8">
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-3 bg-gradient-to-r from-blush to-rose rounded-2xl shadow-lg">
                        <Calendar className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h1 className="font-serif text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                          Wedding Timeline
                        </h1>
                        <p className="text-gray-600 text-lg">
                          {currentProject?.date 
                            ? `${Math.ceil((new Date(currentProject.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days until your big day`
                            : "Organize your perfect wedding journey"
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="relative w-20 h-20 mb-2">
                        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-gray-200"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-blush"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeDasharray={`${completionPercentage}, 100`}
                            strokeLinecap="round"
                            fill="none"
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-800">{completionPercentage}%</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Complete</p>
                    </div>
                    
                    <Button 
                      onClick={() => setIsAddDialogOpen(true)}
                      className="gradient-blush-rose text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      size="lg"
                    >
                      <Plus className="mr-2" size={20} />
                      Add Task
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">In Progress</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Timeline Tasks by Milestone */}
            <div className="space-y-6">
              {safeTasks.length === 0 ? (
                <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                  <CardContent className="p-16">
                    <div className="text-center">
                      <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No tasks yet</h3>
                      <p className="text-gray-500 mb-6">Start planning your wedding by adding your first task.</p>
                      <Button 
                        onClick={() => setIsAddDialogOpen(true)}
                        className="gradient-blush-rose text-white"
                      >
                        <Plus className="mr-2" size={16} />
                        Add Your First Task
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Render each milestone section */}
                  {taskGroups.overdue.length > 0 && (
                    <Card className="border-l-4 border-l-red-500 bg-red-50/80 backdrop-blur-sm shadow-lg">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xl font-semibold text-red-700 flex items-center space-x-2">
                          <AlertTriangle className="h-5 w-5" />
                          <span>Overdue ({taskGroups.overdue.length})</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {taskGroups.overdue.map((task: any) => (
                            <TaskCard key={task.id} task={task} onToggle={handleToggleComplete} onEdit={handleEditTask} />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {taskGroups.thisWeek.length > 0 && (
                    <Card className="border-l-4 border-l-orange-500 bg-orange-50/80 backdrop-blur-sm shadow-lg">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xl font-semibold text-orange-700 flex items-center space-x-2">
                          <CalendarDays className="h-5 w-5" />
                          <span>This Week ({taskGroups.thisWeek.length})</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {taskGroups.thisWeek.map((task: any) => (
                            <TaskCard key={task.id} task={task} onToggle={handleToggleComplete} onEdit={handleEditTask} />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {taskGroups.thisMonth.length > 0 && (
                    <Card className="border-l-4 border-l-blue-500 bg-blue-50/80 backdrop-blur-sm shadow-lg">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xl font-semibold text-blue-700 flex items-center space-x-2">
                          <Calendar className="h-5 w-5" />
                          <span>This Month ({taskGroups.thisMonth.length})</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {taskGroups.thisMonth.map((task: any) => (
                            <TaskCard key={task.id} task={task} onToggle={handleToggleComplete} onEdit={handleEditTask} />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {taskGroups.next3Months.length > 0 && (
                    <Card className="border-l-4 border-l-purple-500 bg-purple-50/80 backdrop-blur-sm shadow-lg">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xl font-semibold text-purple-700 flex items-center space-x-2">
                          <TrendingUp className="h-5 w-5" />
                          <span>Next 3 Months ({taskGroups.next3Months.length})</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {taskGroups.next3Months.map((task: any) => (
                            <TaskCard key={task.id} task={task} onToggle={handleToggleComplete} onEdit={handleEditTask} />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {taskGroups.beforeWedding.length > 0 && (
                    <Card className="border-l-4 border-l-pink-500 bg-pink-50/80 backdrop-blur-sm shadow-lg">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xl font-semibold text-pink-700 flex items-center space-x-2">
                          <Users className="h-5 w-5" />
                          <span>Before Wedding ({taskGroups.beforeWedding.length})</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {taskGroups.beforeWedding.map((task: any) => (
                            <TaskCard key={task.id} task={task} onToggle={handleToggleComplete} onEdit={handleEditTask} />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {taskGroups.noDueDate.length > 0 && (
                    <Card className="border-l-4 border-l-gray-500 bg-gray-50/80 backdrop-blur-sm shadow-lg">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xl font-semibold text-gray-700 flex items-center space-x-2">
                          <Clock className="h-5 w-5" />
                          <span>No Due Date ({taskGroups.noDueDate.length})</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {taskGroups.noDueDate.map((task: any) => (
                            <TaskCard key={task.id} task={task} onToggle={handleToggleComplete} onEdit={handleEditTask} />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Completed Tasks Section */}
                  {taskGroups.completed.length > 0 && (
                    <Card className="border-l-4 border-l-green-500 bg-green-50/80 backdrop-blur-sm shadow-lg">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xl font-semibold text-green-700 flex items-center space-x-2">
                          <CheckCircle2 className="h-5 w-5" />
                          <span>Completed ({taskGroups.completed.length})</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {taskGroups.completed.map((task: any) => (
                            <TaskCard key={task.id} task={task} onToggle={handleToggleComplete} onEdit={handleEditTask} />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">Add New Task</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      <Textarea placeholder="Add details about this task..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {taskCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="gradient-blush-rose text-white"
                  disabled={createTaskMutation.isPending}
                >
                  {createTaskMutation.isPending ? "Adding..." : "Add Task"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">Edit Task</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-6">
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
                      <Textarea placeholder="Add details about this task..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {taskCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingTask(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="gradient-blush-rose text-white"
                  disabled={updateTaskMutation.isPending}
                >
                  {updateTaskMutation.isPending ? 'Updating...' : 'Update Task'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}