import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import LoadingSpinner from "@/components/loading-spinner";
import DragDropTimeline from "@/components/DragDropTimeline";
import KanbanBoard from "@/components/KanbanBoard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, Plus, CheckCircle2, Clock, AlertTriangle, CalendarDays, Target, Users, TrendingUp, 
  Search, SortAsc, PartyPopper, Heart, MapPin, Clock3, ChevronUp, Filter, Grid, List, 
  MoreVertical, Edit, Trash2, MessageSquare, ChevronDown, Sparkles
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { toast } from 'react-hot-toast';

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.string().optional(),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
});

const taskNoteSchema = z.object({
  content: z.string().min(1, "Note content is required"),
  taskId: z.number(),
});

type TaskFormData = z.infer<typeof taskSchema>;
type TaskNoteFormData = z.infer<typeof taskNoteSchema>;

const priorityConfig = {
  high: { 
    color: "bg-gradient-to-r from-red-500 to-pink-500", 
    badge: "bg-red-50 text-red-700 border-red-200",
    icon: AlertTriangle,
    label: "High Priority"
  },
  medium: { 
    color: "bg-gradient-to-r from-amber-500 to-orange-500", 
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
    label: "Medium Priority"
  },
  low: { 
    color: "bg-gradient-to-r from-green-500 to-emerald-500", 
    badge: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle2,
    label: "Low Priority"
  }
};

const taskCategories = [
  "Venue", "Catering", "Photography", "Flowers", "Music", "Transportation", 
  "Attire", "Invitations", "Decorations", "Beauty", "Legal", "Other"
];

export default function TimelineModern() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"timeline" | "kanban" | "calendar">("timeline");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("dueDate");
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());
  const [showCompleted, setShowCompleted] = useState(true);
  // Enhanced filtering states
  const [filterScope, setFilterScope] = useState<"all" | "overdue" | "upcoming" | "high_priority" | "assigned_to_me">("all");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["upcoming", "oneMonth", "sixMonths", "twelveMonths"]));
  const { toast } = useToast();

  // Fetch data
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/projects'],
  });

  const { data: tasks = [], isLoading: tasksLoading, error } = useQuery({
    queryKey: ['/api/tasks'],
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: collaborators = [] } = useQuery({
    queryKey: ['/api/collaborators'],
  });

  const { data: taskNotes = [] } = useQuery({
    queryKey: ['/api/task-notes'],
  });

  // Get current project and wedding date
  const currentProject = projects?.find(p => p.name === "Emma & Jake's Wedding") || projects?.[0];
  const weddingDate = currentProject?.date ? new Date(currentProject.date) : null;

  // Form setup
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      priority: "medium",
      dueDate: "",
      assignedTo: "",
      notes: "",
    },
  });

  const editForm = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      priority: "medium",
      dueDate: "",
      assignedTo: "",
      notes: "",
    },
  });

  const noteForm = useForm<TaskNoteFormData>({
    resolver: zodResolver(taskNoteSchema),
    defaultValues: {
      content: "",
      taskId: 0,
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
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create task",
        variant: "destructive",
      });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TaskFormData> }) =>
      apiRequest(`/api/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task Updated",
        description: "Task updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingTask(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update task",
        variant: "destructive",
      });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/tasks/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task Deleted",
        description: "Task removed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete task",
        variant: "destructive",
      });
    }
  });

  const addNoteMutation = useMutation({
    mutationFn: (data: TaskNoteFormData) => apiRequest('/api/task-notes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/task-notes'] });
      toast({
        title: "Note Added",
        description: "Task note added successfully",
      });
      noteForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add note",
        variant: "destructive",
      });
    }
  });

  // Enhanced helper functions with wedding date-based organization
  const getTimeToWedding = (date: Date): number => {
    if (!weddingDate) return Infinity;
    return Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };

  const getDaysFromWedding = (date: Date): number => {
    if (!weddingDate) return Infinity;
    return Math.ceil((weddingDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getTimelineBucket = (task: any): string => {
    if (!task?.dueDate || !weddingDate) return "noDueDate";
    
    const dueDate = new Date(task.dueDate);
    const daysUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const daysFromWedding = getDaysFromWedding(dueDate);
    
    // Check if overdue
    if (daysUntilDue < 0 && task.status !== 'completed') return "overdue";
    
    // Check if this week
    if (daysUntilDue >= 0 && daysUntilDue <= 7) return "thisWeek";
    
    // Organize by distance from wedding
    if (daysFromWedding >= 365) return "twelveMonths"; // 12+ months out
    if (daysFromWedding >= 180) return "sixMonths";  // 6+ months out  
    if (daysFromWedding >= 30) return "oneMonth";    // 1+ month out
    if (daysFromWedding >= 7) return "weekof";     // Week of wedding
    if (daysFromWedding >= 0) return "weddingday"; // Wedding day and after
    
    return "upcoming";
  };

  const bucketLabels = {
    overdue: { 
      title: "⚠️ Overdue Tasks", 
      icon: AlertTriangle, 
      color: "border-red-500 bg-red-50",
      description: "Tasks that need immediate attention"
    },
    thisWeek: { 
      title: "📅 This Week", 
      icon: Calendar1, 
      color: "border-blue-500 bg-blue-50",
      description: "Tasks due in the next 7 days"
    },
    upcoming: { 
      title: "⏰ Coming Up", 
      icon: Clock3, 
      color: "border-amber-500 bg-amber-50",
      description: "Tasks due soon"
    },
    weekof: { 
      title: "💍 Week of Wedding", 
      icon: Heart, 
      color: "border-rose-500 bg-rose-50",
      description: "Final preparations"
    },
    weddingday: { 
      title: "✨ Wedding Day & Beyond", 
      icon: PartyPopper, 
      color: "border-purple-500 bg-purple-50",
      description: "The big day and honeymoon"
    },
    oneMonth: { 
      title: "📋 1 Month Out", 
      icon: Calendar2, 
      color: "border-green-500 bg-green-50",
      description: "Final month preparations"
    },
    sixMonths: { 
      title: "🎯 6 Months Out", 
      icon: Calendar3, 
      color: "border-indigo-500 bg-indigo-50",
      description: "Mid-stage planning"
    },
    twelveMonths: { 
      title: "🌟 12+ Months Out", 
      icon: Calendar4, 
      color: "border-teal-500 bg-teal-50",
      description: "Early planning phase"
    },
    noDueDate: { 
      title: "📝 No Due Date", 
      icon: FileText, 
      color: "border-gray-400 bg-gray-50",
      description: "Tasks without specific deadlines"
    }
  };

  // Enhanced filtering with new scope options
  const filteredTasks = (tasks || []).filter((task: any) => {
    const matchesSearch = (task?.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task?.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPriority = !filterPriority || task?.priority === filterPriority;
    const matchesCategory = !filterCategory || task?.category === filterCategory;
    const matchesAssignee = !filterAssignee || task?.assignedTo === filterAssignee;
    const matchesCompleted = showCompleted || task?.status !== 'completed';
    
    // Enhanced scope filtering
    let matchesScope = true;
    if (filterScope === "overdue") {
      matchesScope = getTimelineBucket(task) === "overdue";
    } else if (filterScope === "upcoming") {
      matchesScope = ["thisWeek", "upcoming"].includes(getTimelineBucket(task));
    } else if (filterScope === "high_priority") {
      matchesScope = task?.priority === "high";
    } else if (filterScope === "assigned_to_me") {
      matchesScope = task?.assignedTo === "currentUser"; // Would be dynamic in real app
    }
    
    return matchesSearch && matchesPriority && matchesCategory && matchesAssignee && matchesCompleted && matchesScope;
  }).sort((a: any, b: any) => {
    if (sortBy === "dueDate") {
      if (!a?.dueDate && !b?.dueDate) return 0;
      if (!a?.dueDate) return 1;
      if (!b?.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (sortBy === "priority") {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (priorityOrder[b?.priority as keyof typeof priorityOrder] || 0) - (priorityOrder[a?.priority as keyof typeof priorityOrder] || 0);
    }
    if (sortBy === "title") return (a?.title || "").localeCompare(b?.title || "");
    return 0;
  });

  // Group tasks by timeline buckets
  const groupedTasks = filteredTasks.reduce((groups: any, task: any) => {
    const bucket = getTimelineBucket(task);
    if (!groups[bucket]) groups[bucket] = [];
    groups[bucket].push(task);
    return groups;
  }, {});

  // Enhanced stats calculation with completion tracking
  const getTaskStats = () => {
    const total = (tasks || []).length;
    const completed = (tasks || []).filter((task: any) => task?.status === 'completed').length;
    const pending = (tasks || []).filter((task: any) => task?.status === 'pending').length;
    const overdue = (tasks || []).filter((task: any) => {
      if (!task?.dueDate || task?.status === 'completed') return false;
      return new Date(task.dueDate) < new Date();
    }).length;
    const upcoming = (tasks || []).filter((task: any) => {
      if (!task?.dueDate || task?.status === 'completed') return false;
      const dueDate = new Date(task.dueDate);
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return dueDate <= weekFromNow && dueDate >= new Date();
    }).length;
    const highPriority = (tasks || []).filter((task: any) => task?.priority === 'high' && task?.status !== 'completed').length;
    
    return { total, completed, pending, overdue, upcoming, highPriority };
  };

  // Get this week's tasks for upcoming section
  const getThisWeeksTasks = () => {
    return (tasks || []).filter((task: any) => {
      if (!task?.dueDate || task?.status === 'completed') return false;
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return dueDate >= today && dueDate <= weekFromNow;
    }).sort((a: any, b: any) => {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  };

  // Celebration triggers for milestones
  const triggerMilestoneCompleted = (percentage: number) => {
    if (percentage === 25) {
      toast({
        title: "🎉 25% Complete!",
        description: "Great progress on your wedding planning!",
      });
    } else if (percentage === 50) {
      toast({
        title: "🎊 Halfway There!",
        description: "You're making amazing progress on your wedding timeline!",
      });
    } else if (percentage === 75) {
      toast({
        title: "🌟 75% Complete!",
        description: "Almost there! Your wedding planning is coming together beautifully!",
      });
    } else if (percentage === 100) {
      toast({
        title: "🎉 All Tasks Complete!",
        description: "Congratulations! Your wedding timeline is fully complete!",
      });
    }
  };

  const getTaskNotes = (taskId: number) => {
    return (taskNotes || []).filter((note: any) => note?.taskId === taskId);
  };

  const toggleTaskExpansion = (taskId: number) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    editForm.reset({
      title: task.title || "",
      description: task.description || "",
      category: task.category || "",
      priority: task.priority || "medium",
      dueDate: task.dueDate || "",
      assignedTo: task.assignedTo || "",
      notes: task.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleToggleComplete = (task: any) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const oldStats = getTaskStats();
    
    updateTaskMutation.mutate({ 
      id: task.id, 
      data: { ...task, status: newStatus } 
    });

    // Check for milestone completion after state change
    if (newStatus === 'completed') {
      const newCompleted = oldStats.completed + 1;
      const newPercentage = Math.round((newCompleted / oldStats.total) * 100);
      
      // Trigger celebration for major milestones
      if ([25, 50, 75, 100].includes(newPercentage)) {
        setTimeout(() => triggerMilestoneCompleted(newPercentage), 500);
      }
    }
  };

  const toggleSectionExpanded = (sectionKey: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionKey)) {
      newExpanded.delete(sectionKey);
    } else {
      newExpanded.add(sectionKey);
    }
    setExpandedSections(newExpanded);
  };

  const handleAssignTask = (task: any, assignee: string) => {
    updateTaskMutation.mutate({ 
      id: task.id, 
      data: { ...task, assignedTo: assignee } 
    });
  };

  const handleAddNote = (task: any) => {
    setSelectedTask(task);
    noteForm.setValue('taskId', task.id);
    setIsNotesDialogOpen(true);
  };

  const onSubmit = (data: TaskFormData) => {
    createTaskMutation.mutate(data);
  };

  const onEditSubmit = (data: TaskFormData) => {
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, data });
    }
  };

  const onNoteSubmit = (data: TaskNoteFormData) => {
    addNoteMutation.mutate(data);
  };

  const stats = getTaskStats();
  const thisWeeksTasks = getThisWeeksTasks();
  const completionPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const daysUntilWedding = weddingDate ? getTimeToWedding(weddingDate) : null;

  if (tasksLoading || projectsLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-16">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blush/20 to-rose/20 rounded-full blur-3xl"></div>
              <Calendar className="relative h-20 w-20 text-blush mx-auto mb-6" />
            </div>
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
              <Sparkles className="mr-2" size={20} />
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
          {/* Enhanced Header with Progress Tracker */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6 space-y-4 md:space-y-0">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="p-2 md:p-3 bg-rose-500 rounded-lg">
                  <Calendar className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl md:text-4xl font-semibold text-gray-900 tracking-tight">
                    Timeline
                  </h1>
                  <p className="text-gray-600 text-xs md:text-lg mt-1">
                    {daysUntilWedding !== null && daysUntilWedding > 0
                      ? `${daysUntilWedding} days until your special day`
                      : daysUntilWedding === 0 
                      ? "Today is your wedding day! 💍"
                      : daysUntilWedding !== null && daysUntilWedding < 0
                      ? "Congratulations on your recent wedding! 🎉"
                      : "Organize your perfect wedding journey"
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 md:space-x-3 w-full md:w-auto">
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="gradient-blush-rose text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex-1 md:flex-none"
                  size="lg"
                >
                  <Plus className="mr-2" size={20} />
                  Add Task
                </Button>
              </div>
            </div>

            {/* Progress Tracker Section */}
            <Card className="mb-6 border-0 bg-gradient-to-r from-rose-50 to-blush-50 shadow-lg">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Overall Progress */}
                  <div className="lg:col-span-1">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Overall Progress</h3>
                      <div className="relative inline-flex items-center justify-center">
                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-gray-200"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={`${2 * Math.PI * 45}`}
                            strokeDashoffset={`${2 * Math.PI * 45 * (1 - completionPercentage / 100)}`}
                            className="text-rose-500 transition-all duration-1000 ease-out"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-rose-600">{completionPercentage}%</div>
                            <div className="text-sm text-gray-600">Complete</div>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {stats.completed} of {stats.total} tasks completed
                      </p>
                    </div>
                  </div>

                  {/* This Week's Tasks */}
                  <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">This Week's Focus</h3>
                    {thisWeeksTasks.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                        <p className="text-gray-600">No tasks due this week - you're all caught up!</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-48 overflow-y-auto">
                        {thisWeeksTasks.slice(0, 4).map((task: any) => (
                          <div key={task.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                            <button
                              onClick={() => handleToggleComplete(task)}
                              className="flex-shrink-0"
                            >
                              {task.status === 'completed' ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : (
                                <div className="h-5 w-5 border-2 border-gray-300 rounded-full hover:border-rose-500 transition-colors" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                {task.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                Due {new Date(task.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge 
                              className={`${priorityConfig[task.priority as keyof typeof priorityConfig]?.badge}`}
                            >
                              {task.priority}
                            </Badge>
                          </div>
                        ))}
                        {thisWeeksTasks.length > 4 && (
                          <p className="text-xs text-center text-gray-500 mt-2">
                            +{thisWeeksTasks.length - 4} more tasks this week
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Stats Grid with Quick Filters */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <button 
              onClick={() => setFilterScope(filterScope === "all" ? "all" : "all")}
              className={`${filterScope === "all" ? "ring-2 ring-rose-500" : ""}`}
            >
              <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mx-auto w-fit mb-2">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-xs font-medium text-gray-600 mb-1">All Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </CardContent>
              </Card>
            </button>

            <button 
              onClick={() => setFilterScope(filterScope === "overdue" ? "all" : "overdue")}
              className={`${filterScope === "overdue" ? "ring-2 ring-red-500" : ""}`}
            >
              <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg mx-auto w-fit mb-2">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Overdue</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
                </CardContent>
              </Card>
            </button>

            <button 
              onClick={() => setFilterScope(filterScope === "upcoming" ? "all" : "upcoming")}
              className={`${filterScope === "upcoming" ? "ring-2 ring-blue-500" : ""}`}
            >
              <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg mx-auto w-fit mb-2">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Due Soon</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
                </CardContent>
              </Card>
            </button>

            <button 
              onClick={() => setFilterScope(filterScope === "high_priority" ? "all" : "high_priority")}
              className={`${filterScope === "high_priority" ? "ring-2 ring-orange-500" : ""}`}
            >
              <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg mx-auto w-fit mb-2">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-xs font-medium text-gray-600 mb-1">High Priority</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.highPriority}</p>
                </CardContent>
              </Card>
            </button>

            <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg mx-auto w-fit mb-2">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <p className="text-xs font-medium text-gray-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg mx-auto w-fit mb-2">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <p className="text-xs font-medium text-gray-600 mb-1">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Filtering Controls */}
          <div className="mb-6">
            <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Search Tasks</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by title or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {taskCategories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Priority</label>
                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                      <SelectTrigger>
                        <SelectValue placeholder="All priorities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Priorities</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dueDate">Due Date</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Timeline Views */}
          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="timeline" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Timeline Buckets</span>
              </TabsTrigger>
              <TabsTrigger value="drag-drop" className="flex items-center space-x-2">
                <Grid className="h-4 w-4" />
                <span>Drag & Drop</span>
              </TabsTrigger>
              <TabsTrigger value="kanban" className="flex items-center space-x-2">
                <List className="h-4 w-4" />
                <span>Kanban Board</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="drag-drop" className="space-y-6">
              <DragDropTimeline 
                tasks={filteredTasks}
                onTaskUpdate={(taskId, updates) => {
                  updateTaskMutation.mutate({ id: taskId, data: updates });
                }}
                onTaskReorder={(reorderedTasks) => {
                  // Handle task reordering logic here
                  console.log('Tasks reordered:', reorderedTasks);
                }}
                projectId={currentProject?.id || 0}
              />
            </TabsContent>

            <TabsContent value="kanban" className="space-y-6">
              <KanbanBoard 
                tasks={filteredTasks}
                onTaskUpdate={(taskId, updates) => {
                  updateTaskMutation.mutate({ id: taskId, data: updates });
                }}
                onTaskReorder={(reorderedTasks) => {
                  // Handle task reordering logic here
                  console.log('Tasks reordered:', reorderedTasks);
                }}
                projectId={currentProject?.id || 0}
              />
            </TabsContent>

            <TabsContent value="timeline" className="space-y-6">
              {/* Wedding Timeline Buckets */}
              <div className="space-y-6">
                {["overdue", "thisWeek", "upcoming", "weekof", "weddingday", "oneMonth", "sixMonths", "twelveMonths", "noDueDate"].map((bucketKey) => {
                  const bucket = bucketLabels[bucketKey as keyof typeof bucketLabels];
                  const bucketTasks = groupedTasks[bucketKey] || [];
                  
                  if (bucketTasks.length === 0) return null;
                  
                  const Icon = bucket.icon;
                  const isExpanded = expandedSections.has(bucketKey);
                  
                  return (
                    <Card key={bucketKey} className={`border-l-4 ${bucket.color} shadow-lg`}>
                      <CardHeader 
                        className="cursor-pointer hover:bg-gray-50/50 transition-colors"
                        onClick={() => toggleSectionExpanded(bucketKey)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Icon className="h-6 w-6 text-gray-700" />
                            <div>
                              <CardTitle className="text-lg">{bucket.title}</CardTitle>
                              <p className="text-sm text-gray-600 mt-1">{bucket.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="bg-white">
                              {bucketTasks.length} task{bucketTasks.length !== 1 ? 's' : ''}
                            </Badge>
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      
                      {isExpanded && (
                        <CardContent className="pt-0">
                          <div className="space-y-4">
                            {bucketTasks.map((task: any) => (
                              <div key={task.id} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start space-x-3 flex-1">
                                    {/* Task Completion Checkbox */}
                                    <button
                                      onClick={() => handleToggleComplete(task)}
                                      className="flex-shrink-0 mt-1"
                                    >
                                      {task.status === 'completed' ? (
                                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                                      ) : (
                                        <div className="h-6 w-6 border-2 border-gray-300 rounded-full hover:border-rose-500 transition-colors" />
                                      )}
                                    </button>
                                    
                                    <div className="flex-1 min-w-0">
                                      <h4 className={`font-medium ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                        {task.title}
                                      </h4>
                                      {task.description && (
                                        <p className={`text-sm mt-1 ${task.status === 'completed' ? 'text-gray-400' : 'text-gray-600'}`}>
                                          {task.description}
                                        </p>
                                      )}
                                      
                                      <div className="flex items-center space-x-4 mt-3">
                                        {task.dueDate && (
                                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                                            <CalendarDays className="h-4 w-4" />
                                            <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                                          </div>
                                        )}
                                        
                                        {task.category && (
                                          <Badge variant="outline" className="text-xs">
                                            {task.category}
                                          </Badge>
                                        )}
                                    
                                    <Badge 
                                      className={`text-xs ${priorityConfig[task.priority as keyof typeof priorityConfig]?.badge}`}
                                    >
                                      {task.priority}
                                    </Badge>
                                    
                                    {task.assignedTo && (
                                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                                        <Users className="h-4 w-4" />
                                        <span>{task.assignedTo}</span>
                                      </div>
                                    )}
                                      </div>
                                    </div>
                                    
                                    {/* Task Actions */}
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                          <Edit className="h-4 w-4 mr-2" />
                                          Edit Task
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleAddNote(task)}>
                                          <MessageSquare className="h-4 w-4 mr-2" />
                                          Add Note
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                          onClick={() => deleteTaskMutation.mutate(task.id)}
                                          className="text-red-600"
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete Task
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Task Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Wedding Task</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Task Title*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Book wedding venue" {...field} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {taskCategories.map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
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
                
                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign To</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select assignee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="me">Me</SelectItem>
                          {collaborators.map((person: any) => (
                            <SelectItem key={person.id} value={person.name}>{person.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional details about this task..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createTaskMutation.isPending}
                  className="gradient-blush-rose text-white"
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Task Title*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Book wedding venue" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
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
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
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
                
                <FormField
                  control={editForm.control}
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
                
                <FormField
                  control={editForm.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign To</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select assignee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="me">Me</SelectItem>
                          {collaborators.map((person: any) => (
                            <SelectItem key={person.id} value={person.name}>{person.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional details about this task..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateTaskMutation.isPending}
                  className="gradient-blush-rose text-white"
                >
                  {updateTaskMutation.isPending ? "Updating..." : "Update Task"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
