import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

import LoadingSpinner from "@/components/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, Plus, CheckCircle2, Clock, AlertTriangle, CalendarDays, Target, 
  Users, TrendingUp, MapPin, Heart, Sparkles, Edit3, Trash2, Filter,
  Star, Award, ChevronDown, ChevronRight, ArrowRight, Zap
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
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-green-100 text-green-800 border-green-200"
};

const taskCategories = [
  "Venue", "Catering", "Photography", "Flowers", "Music", "Transportation", 
  "Attire", "Invitations", "Decorations", "Beauty", "Legal", "Other"
];

// Wedding timeline milestones
const weddingMilestones = [
  { 
    name: "12 Months Before", 
    weeks: 52, 
    tasks: ["Book venue", "Set budget", "Choose wedding party", "Start dress shopping"],
    color: "from-purple-500 to-pink-500",
    icon: Heart
  },
  { 
    name: "9 Months Before", 
    weeks: 39, 
    tasks: ["Book photographer", "Choose caterer", "Send save-the-dates", "Book music/DJ"],
    color: "from-blue-500 to-purple-500",
    icon: Star
  },
  { 
    name: "6 Months Before", 
    weeks: 26, 
    tasks: ["Order invitations", "Book transportation", "Plan honeymoon", "Register for gifts"],
    color: "from-teal-500 to-blue-500",
    icon: Award
  },
  { 
    name: "3 Months Before", 
    weeks: 13, 
    tasks: ["Send invitations", "Final dress fitting", "Confirm details", "Plan rehearsal"],
    color: "from-orange-500 to-red-500",
    icon: Target
  },
  { 
    name: "1 Month Before", 
    weeks: 4, 
    tasks: ["Final headcount", "Confirm timeline", "Pack for honeymoon", "Marriage license"],
    color: "from-pink-500 to-rose-500",
    icon: Sparkles
  }
];

// Enhanced Task Card Component
function EnhancedTaskCard({ task, onToggle, onEdit, onDelete }: { 
  task: any; 
  onToggle: (task: any) => void; 
  onEdit: (task: any) => void;
  onDelete: (task: any) => void;
}) {
  const dueDateInfo = getDaysUntilDue(task?.dueDate);
  const [showActions, setShowActions] = useState(false);
  
  return (
    <div 
      className="group relative p-4 bg-white rounded-xl border border-gray-200 hover:shadow-lg hover:border-blush/30 transition-all duration-300 cursor-pointer"
      onClick={() => onEdit(task)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Priority indicator */}
      <div className={`absolute top-0 left-0 w-1 h-full rounded-l-xl bg-gradient-to-b ${
        task?.priority === 'high' ? 'from-red-400 to-red-600' :
        task?.priority === 'medium' ? 'from-yellow-400 to-orange-500' :
        'from-green-400 to-green-600'
      }`} />
      
      <div className="flex items-start justify-between pl-3">
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
            <div className="flex items-center justify-between mb-2">
              <h4 className={`font-semibold text-lg leading-tight ${
                task?.status === 'completed' 
                  ? 'line-through text-gray-500' 
                  : 'text-gray-900 group-hover:text-blush'
              }`}>
                {task?.title || 'Untitled Task'}
              </h4>
              
              {/* Action buttons */}
              {showActions && (
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(task);
                    }}
                    className="p-2 h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                  >
                    <Edit3 size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(task);
                    }}
                    className="p-2 h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              )}
            </div>
            
            {task?.description && (
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                {task.description}
              </p>
            )}
            
            <div className="flex items-center flex-wrap gap-2">
              {task?.priority && (
                <Badge className={`${priorityColors[task.priority as keyof typeof priorityColors]} font-medium border`}>
                  {task.priority}
                </Badge>
              )}
              {task?.category && (
                <Badge variant="outline" className="text-xs border-gray-300 bg-gray-50">
                  {task.category}
                </Badge>
              )}
              {task?.dueDate && (
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${dueDateInfo.color} flex items-center space-x-1 border`}>
                  <Clock size={12} />
                  <span>{dueDateInfo.text}</span>
                </div>
              )}
              {dueDateInfo.urgent && (
                <div className="flex items-center space-x-1 text-red-600">
                  <AlertTriangle size={16} />
                  <span className="text-xs font-medium">Urgent</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Milestone Card Component
function MilestoneCard({ milestone, weeksBefore, isActive, progress }: {
  milestone: any;
  weeksBefore: number;
  isActive: boolean;
  progress: number;
}) {
  const Icon = milestone.icon;
  
  return (
    <div className={`relative p-6 rounded-2xl border transition-all duration-300 ${
      isActive 
        ? 'border-blush bg-gradient-to-r from-blush/5 to-rose/5 shadow-lg' 
        : 'border-gray-200 bg-white hover:shadow-md'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${milestone.color} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{milestone.name}</h3>
            <p className="text-sm text-gray-600">{weeksBefore} weeks before wedding</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{progress}%</div>
          <div className="text-xs text-gray-500">Complete</div>
        </div>
      </div>
      
      <Progress value={progress} className="mb-4 h-2" />
      
      <div className="space-y-2">
        {milestone.tasks.map((task: string, index: number) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${
              index < Math.floor((progress / 100) * milestone.tasks.length) 
                ? 'bg-green-500' 
                : 'bg-gray-300'
            }`} />
            <span className={`${
              index < Math.floor((progress / 100) * milestone.tasks.length) 
                ? 'text-gray-900 line-through' 
                : 'text-gray-600'
            }`}>
              {task}
            </span>
          </div>
        ))}
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
      color: "text-red-600 bg-red-50 border-red-200", 
      urgent: true 
    };
  } else if (diffDays === 0) {
    return { 
      text: "Due today", 
      color: "text-orange-600 bg-orange-50 border-orange-200", 
      urgent: true 
    };
  } else if (diffDays === 1) {
    return { 
      text: "Due tomorrow", 
      color: "text-orange-600 bg-orange-50 border-orange-200", 
      urgent: true 
    };
  } else if (diffDays <= 7) {
    return { 
      text: `Due in ${diffDays} days`, 
      color: "text-yellow-600 bg-yellow-50 border-yellow-200", 
      urgent: false 
    };
  } else {
    return { 
      text: `Due in ${diffDays} days`, 
      color: "text-gray-600 bg-gray-50 border-gray-200", 
      urgent: false 
    };
  }
};

export default function Timeline() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("timeline");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const { toast } = useToast();

  // Fetch data with proper error handling
  const { data: weddingProjects, isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/projects'],
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
        description: "New wedding planning task added successfully",
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
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/tasks/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task Deleted",
        description: "Task removed successfully",
      });
    },
  });

  const onSubmit = (data: TaskFormData) => {
    const taskData = {
      title: data.title,
      description: data.description || null,
      category: data.category || null,
      priority: data.priority || 'medium',
      dueDate: data.dueDate || null,
    };
    createTaskMutation.mutate(taskData);
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

  const handleDeleteTask = (task: any) => {
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      deleteTaskMutation.mutate(task.id);
    }
  };

  // Safe data access
  const safeWeddingProjects = weddingProjects || [];
  const safeTasks = tasks || [];
  const currentProject = safeWeddingProjects.find(p => p.name === "Emma & Jake's Wedding") || safeWeddingProjects[0];
  
  // Filter tasks
  const filteredTasks = useMemo(() => {
    return safeTasks.filter((task: any) => {
      const categoryMatch = filterCategory === "all" || task.category === filterCategory;
      const priorityMatch = filterPriority === "all" || task.priority === filterPriority;
      return categoryMatch && priorityMatch;
    });
  }, [safeTasks, filterCategory, filterPriority]);

  // Function to group tasks by timeline milestones
  const groupTasksByMilestone = (tasks: any[]) => {
    const today = new Date();
    
    const groups = {
      overdue: [] as any[],
      thisWeek: [] as any[],
      thisMonth: [] as any[],
      next3Months: [] as any[],
      beforeWedding: [] as any[],
      noDueDate: [] as any[]
    };

    const sortedTasks = [...tasks].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    sortedTasks.forEach(task => {
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

  const taskGroups = groupTasksByMilestone(filteredTasks);
  
  // Calculate milestone progress
  const calculateMilestoneProgress = (milestone: any) => {
    const relevantTasks = safeTasks.filter((task: any) => 
      milestone.tasks.some((milestoneTask: string) => 
        task.title.toLowerCase().includes(milestoneTask.toLowerCase().split(' ')[0])
      )
    );
    const completedTasks = relevantTasks.filter((task: any) => task.status === 'completed');
    return relevantTasks.length > 0 ? Math.round((completedTasks.length / relevantTasks.length) * 100) : 0;
  };

  // Safe stats calculation
  const getEnhancedStats = () => {
    const total = safeTasks.length;
    const completed = safeTasks.filter((task: any) => task?.status === 'completed').length;
    const pending = safeTasks.filter((task: any) => task?.status === 'pending').length;
    const overdue = taskGroups.overdue.length;
    const highPriority = safeTasks.filter((task: any) => task?.priority === 'high').length;
    const thisWeek = taskGroups.thisWeek.length;
    return { total, completed, pending, overdue, highPriority, thisWeek };
  };

  const stats = getEnhancedStats();
  const completionPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // Calculate days until wedding
  const daysUntilWedding = currentProject?.date 
    ? Math.ceil((new Date(currentProject.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  if (tasksLoading || projectsLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading your wedding timeline..." />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-cream via-white to-blush/5 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header Section */}
        <div className="relative mb-8">
              {/* Main Hero Card */}
              <div className="relative bg-gradient-to-br from-white via-cream/30 to-blush/10 backdrop-blur-sm rounded-3xl p-8 border border-white/60 shadow-2xl overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 bg-gradient-to-r from-blush/5 via-transparent to-rose/5" />
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blush/20 to-rose/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-purple/10 to-blush/20 rounded-full blur-2xl" />
                <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-blush/40 rounded-full animate-ping" />
                <div className="absolute top-1/4 right-1/3 w-1 h-1 bg-rose/60 rounded-full animate-pulse" />
                
                <div className="relative flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-6 mb-6">
                      {/* Animated Icon Container */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blush to-rose rounded-2xl blur-md opacity-50 animate-pulse" />
                        <div className="relative p-4 bg-gradient-to-br from-blush via-rose to-purple rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300">
                          <Calendar className="h-10 w-10 text-white drop-shadow-lg" />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h1 className="font-serif text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-blush bg-clip-text text-transparent leading-tight mb-3">
                          Wedding Timeline
                        </h1>
                        <div className="flex items-center flex-wrap gap-4">
                          <p className="text-gray-600 text-xl font-medium">
                            {currentProject?.name || "Your Wedding Journey"}
                          </p>
                          {daysUntilWedding && (
                            <div className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-blush via-rose to-purple rounded-full text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                              <Heart size={16} className="animate-pulse" />
                              <span className="text-sm">{daysUntilWedding} days to go!</span>
                              <Sparkles size={14} className="animate-pulse" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-8">
                    {/* Enhanced Progress Circle */}
                    <div className="relative text-center">
                      {/* Outer glow ring */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blush/20 to-rose/20 rounded-full blur-lg" />
                      
                      <div className="relative w-28 h-28 mb-3">
                        <svg className="w-28 h-28 transform -rotate-90 drop-shadow-lg" viewBox="0 0 36 36">
                          {/* Background circle */}
                          <path
                            className="text-gray-200"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          {/* Progress circle with gradient */}
                          <defs>
                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#F8B5C1" />
                              <stop offset="50%" stopColor="#E11D48" />
                              <stop offset="100%" stopColor="#9333EA" />
                            </linearGradient>
                          </defs>
                          <path
                            stroke="url(#progressGradient)"
                            strokeWidth="3"
                            strokeDasharray={`${completionPercentage}, 100`}
                            strokeLinecap="round"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            className="drop-shadow-lg animate-pulse"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <span className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-blush bg-clip-text text-transparent">
                              {completionPercentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 font-semibold tracking-wide">Complete</p>
                    </div>
                    
                    {/* Enhanced Add Task Button */}
                    <Button 
                      onClick={() => setIsAddDialogOpen(true)}
                      className="relative overflow-hidden bg-gradient-to-r from-blush via-rose to-purple text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 px-8 py-4 text-lg font-semibold group"
                      size="lg"
                    >
                      {/* Button shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      
                      <div className="relative flex items-center space-x-3">
                        <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                        <span>Add Task</span>
                        <Sparkles className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-300" />
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
              <Card 
                className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
                onClick={() => setFilterCategory("all")}
              >
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                    <div className="text-sm text-gray-600">Total Tasks</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
                onClick={() => {
                  setActiveTab("timeline");
                  // Scroll to completed tasks section
                  setTimeout(() => {
                    const completedSection = document.querySelector('[data-section="completed"]');
                    if (completedSection) {
                      completedSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }}
              >
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
                onClick={() => {
                  setActiveTab("timeline");
                  // Scroll to pending tasks
                  setTimeout(() => {
                    const pendingSection = document.querySelector('[data-section="pending"]');
                    if (pendingSection) {
                      pendingSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }}
              >
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
                onClick={() => {
                  setActiveTab("timeline");
                  // Scroll to overdue tasks
                  setTimeout(() => {
                    const overdueSection = document.querySelector('[data-section="overdue"]');
                    if (overdueSection) {
                      overdueSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }}
              >
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                    <div className="text-sm text-gray-600">Overdue</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
                onClick={() => {
                  setFilterPriority("high");
                  setActiveTab("timeline");
                }}
              >
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.highPriority}</div>
                    <div className="text-sm text-gray-600">High Priority</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
                onClick={() => {
                  setActiveTab("timeline");
                  // Scroll to this week tasks
                  setTimeout(() => {
                    const thisWeekSection = document.querySelector('[data-section="thisWeek"]');
                    if (thisWeekSection) {
                      thisWeekSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }}
              >
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.thisWeek}</div>
                    <div className="text-sm text-gray-600">This Week</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="flex items-center justify-between">
                <TabsList className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg p-1">
                  <TabsTrigger value="timeline" className="data-[state=active]:bg-blush data-[state=active]:text-white">
                    <CalendarDays className="mr-2" size={16} />
                    Timeline View
                  </TabsTrigger>
                  <TabsTrigger value="milestones" className="data-[state=active]:bg-blush data-[state=active]:text-white">
                    <Target className="mr-2" size={16} />
                    Milestones
                  </TabsTrigger>
                </TabsList>
                
                {/* Filters */}
                <div className="flex items-center space-x-4">
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-48 bg-white/80 backdrop-blur-sm border-gray-200">
                      <Filter size={16} className="mr-2" />
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {taskCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-40 bg-white/80 backdrop-blur-sm border-gray-200">
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <TabsContent value="timeline" className="space-y-6">
                {filteredTasks.length === 0 ? (
                  <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                    <CardContent className="p-16">
                      <div className="text-center">
                        <Calendar className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                        <h3 className="text-2xl font-semibold text-gray-600 mb-3">No tasks yet</h3>
                        <p className="text-gray-500 mb-8">Start planning your perfect wedding by adding your first task.</p>
                        <Button 
                          onClick={() => setIsAddDialogOpen(true)}
                          className="gradient-blush-rose text-white shadow-lg px-8 py-3"
                          size="lg"
                        >
                          <Plus className="mr-2" size={20} />
                          Create Your First Task
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Render each timeline section */}
                    {taskGroups.overdue.length > 0 && (
                      <Card className="border-l-4 border-l-red-500 bg-red-50/80 backdrop-blur-sm shadow-lg" data-section="overdue">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-xl font-semibold text-red-700 flex items-center space-x-2">
                            <AlertTriangle className="h-6 w-6" />
                            <span>Overdue Tasks ({taskGroups.overdue.length})</span>
                            <Badge className="bg-red-100 text-red-800 border-red-200">Urgent</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {taskGroups.overdue.map((task: any) => (
                              <EnhancedTaskCard 
                                key={task.id} 
                                task={task} 
                                onToggle={handleToggleComplete} 
                                onEdit={handleEditTask}
                                onDelete={handleDeleteTask}
                              />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {taskGroups.thisWeek.length > 0 && (
                      <Card className="border-l-4 border-l-orange-500 bg-orange-50/80 backdrop-blur-sm shadow-lg" data-section="thisWeek">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-xl font-semibold text-orange-700 flex items-center space-x-2">
                            <CalendarDays className="h-6 w-6" />
                            <span>This Week ({taskGroups.thisWeek.length})</span>
                            <Badge className="bg-orange-100 text-orange-800 border-orange-200">Soon</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {taskGroups.thisWeek.map((task: any) => (
                              <EnhancedTaskCard 
                                key={task.id} 
                                task={task} 
                                onToggle={handleToggleComplete} 
                                onEdit={handleEditTask}
                                onDelete={handleDeleteTask}
                              />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {taskGroups.thisMonth.length > 0 && (
                      <Card className="border-l-4 border-l-blue-500 bg-blue-50/80 backdrop-blur-sm shadow-lg">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-xl font-semibold text-blue-700 flex items-center space-x-2">
                            <Calendar className="h-6 w-6" />
                            <span>This Month ({taskGroups.thisMonth.length})</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {taskGroups.thisMonth.map((task: any) => (
                              <EnhancedTaskCard 
                                key={task.id} 
                                task={task} 
                                onToggle={handleToggleComplete} 
                                onEdit={handleEditTask}
                                onDelete={handleDeleteTask}
                              />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {taskGroups.next3Months.length > 0 && (
                      <Card className="border-l-4 border-l-purple-500 bg-purple-50/80 backdrop-blur-sm shadow-lg">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-xl font-semibold text-purple-700 flex items-center space-x-2">
                            <TrendingUp className="h-6 w-6" />
                            <span>Next 3 Months ({taskGroups.next3Months.length})</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {taskGroups.next3Months.map((task: any) => (
                              <EnhancedTaskCard 
                                key={task.id} 
                                task={task} 
                                onToggle={handleToggleComplete} 
                                onEdit={handleEditTask}
                                onDelete={handleDeleteTask}
                              />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {taskGroups.beforeWedding.length > 0 && (
                      <Card className="border-l-4 border-l-pink-500 bg-pink-50/80 backdrop-blur-sm shadow-lg">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-xl font-semibold text-pink-700 flex items-center space-x-2">
                            <Users className="h-6 w-6" />
                            <span>Before Wedding ({taskGroups.beforeWedding.length})</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {taskGroups.beforeWedding.map((task: any) => (
                              <EnhancedTaskCard 
                                key={task.id} 
                                task={task} 
                                onToggle={handleToggleComplete} 
                                onEdit={handleEditTask}
                                onDelete={handleDeleteTask}
                              />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {taskGroups.noDueDate.length > 0 && (
                      <Card className="border-l-4 border-l-gray-500 bg-gray-50/80 backdrop-blur-sm shadow-lg">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-xl font-semibold text-gray-700 flex items-center space-x-2">
                            <Clock className="h-6 w-6" />
                            <span>No Due Date ({taskGroups.noDueDate.length})</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {taskGroups.noDueDate.map((task: any) => (
                              <EnhancedTaskCard 
                                key={task.id} 
                                task={task} 
                                onToggle={handleToggleComplete} 
                                onEdit={handleEditTask}
                                onDelete={handleDeleteTask}
                              />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="milestones" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {weddingMilestones.map((milestone, index) => {
                    const progress = calculateMilestoneProgress(milestone);
                    const isActive = daysUntilWedding ? 
                      (daysUntilWedding <= milestone.weeks && daysUntilWedding > (weddingMilestones[index + 1]?.weeks || 0)) : 
                      false;
                    
                    return (
                      <MilestoneCard
                        key={milestone.name}
                        milestone={milestone}
                        weeksBefore={milestone.weeks}
                        isActive={isActive}
                        progress={progress}
                      />
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
        </div>

        {/* Add Task Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold flex items-center space-x-2">
              <Plus className="h-6 w-6 text-blush" />
              <span>Add New Wedding Task</span>
            </DialogTitle>
            <DialogDescription>
              Create tasks to track your wedding planning progress with categories, priorities, and due dates.
            </DialogDescription>
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
                      <Input placeholder="e.g., Book wedding venue" {...field} className="text-lg" />
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
                      <Textarea 
                        placeholder="Add details, notes, or requirements for this task..." 
                        {...field} 
                        className="min-h-[100px]"
                      />
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
                  {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold flex items-center space-x-2">
              <Edit3 className="h-6 w-6 text-blush" />
              <span>Edit Wedding Task</span>
            </DialogTitle>
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
                      <Input placeholder="e.g., Book wedding venue" {...field} className="text-lg" />
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
                      <Textarea 
                        placeholder="Add details, notes, or requirements for this task..." 
                        {...field} 
                        className="min-h-[100px]"
                      />
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