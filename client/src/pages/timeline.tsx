import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import LoadingSpinner from "@/components/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, Plus, CheckCircle2, Clock, AlertTriangle, CalendarDays, Target, Users, TrendingUp, 
  MessageSquare, UserPlus, Edit, Trash2, MoreVertical, Bell, CheckSquare, Star, Filter,
  Sparkles, Zap, ArrowRight, Play, Pause, RotateCcw, Flag, BookOpen, FileText, Send,
  ChevronDown, ChevronRight, Activity, Timer, Hash, Grid, List, Search, SortAsc
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
  const { toast } = useToast();

  // Fetch data
  const { data: weddingProjects, isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/wedding-projects'],
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

  // Helper functions
  const filteredTasks = (tasks || []).filter((task: any) => {
    const matchesSearch = (task?.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task?.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPriority = !filterPriority || task?.priority === filterPriority;
    const matchesCategory = !filterCategory || task?.category === filterCategory;
    const matchesAssignee = !filterAssignee || task?.assignedTo === filterAssignee;
    const matchesCompleted = showCompleted || task?.status !== 'completed';
    
    return matchesSearch && matchesPriority && matchesCategory && matchesAssignee && matchesCompleted;
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
    
    return { total, completed, pending, overdue, upcoming };
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
    updateTaskMutation.mutate({ 
      id: task.id, 
      data: { ...task, status: newStatus } 
    });
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
  const currentProject = weddingProjects?.[0];
  const completionPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  if (tasksLoading || projectsLoading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-cream via-white to-blush/5">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Header />
          <div className="p-6">
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-cream via-white to-blush/5">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Header />
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
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-cream via-white to-blush/5">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <Header />
        
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Modern Header Section */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blush/10 to-rose/10 rounded-3xl blur-3xl"></div>
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

            {/* Modern Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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

              <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl shadow-lg">
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Overdue</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.overdue}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl shadow-lg">
                      <Bell className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Due Soon</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.upcoming}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Modern Filter & Search Bar */}
            <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 flex-1">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <Input
                        placeholder="Search tasks by title or description..."
                        className="pl-10 border-gray-200 bg-white/80 backdrop-blur-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                      <SelectTrigger className="w-full md:w-40 border-gray-200 bg-white/80">
                        <Flag size={16} className="mr-2" />
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Priorities</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="low">Low Priority</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-full md:w-40 border-gray-200 bg-white/80">
                        <Hash size={16} className="mr-2" />
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {taskCategories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                      <SelectTrigger className="w-full md:w-40 border-gray-200 bg-white/80">
                        <Users size={16} className="mr-2" />
                        <SelectValue placeholder="Assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Assignees</SelectItem>
                        {collaborators.map((person: any) => (
                          <SelectItem key={person.id} value={person.name}>{person.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Button
                      variant={showCompleted ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowCompleted(!showCompleted)}
                      className="bg-white/80"
                    >
                      <CheckSquare size={16} className="mr-2" />
                      {showCompleted ? "Hide" : "Show"} Completed
                    </Button>
                    
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40 border-gray-200 bg-white/80">
                        <SortAsc size={16} className="mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dueDate">Sort by Due Date</SelectItem>
                        <SelectItem value="priority">Sort by Priority</SelectItem>
                        <SelectItem value="title">Sort by Title</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="flex border border-gray-200 rounded-lg bg-white/80">
                      <Button
                        variant={viewMode === "timeline" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("timeline")}
                        className="rounded-r-none"
                      >
                        <List size={16} />
                      </Button>
                      <Button
                        variant={viewMode === "kanban" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("kanban")}
                        className="rounded-none border-x"
                      >
                        <Grid size={16} />
                      </Button>
                      <Button
                        variant={viewMode === "calendar" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("calendar")}
                        className="rounded-l-none"
                      >
                        <Calendar size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Modern Task List */}
            <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-6 w-6 text-blush" />
                    <span>Wedding Tasks ({filteredTasks.length})</span>
                  </div>
                  {filteredTasks.length > 0 && (
                    <span className="text-sm font-normal text-gray-500">
                      {stats.completed} of {stats.total} tasks completed
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blush/20 to-rose/20 rounded-full blur-3xl"></div>
                      <CheckCircle2 className="relative h-16 w-16 text-blush mx-auto mb-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                      {searchTerm || filterPriority || filterCategory || filterAssignee 
                        ? "No tasks match your filters" 
                        : "No tasks yet"}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {searchTerm || filterPriority || filterCategory || filterAssignee 
                        ? "Try adjusting your search or filters" 
                        : "Create your first wedding planning task to get started"}
                    </p>
                    {!searchTerm && !filterPriority && !filterCategory && !filterAssignee && (
                      <Button
                        onClick={() => setIsAddDialogOpen(true)}
                        className="gradient-blush-rose text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                        size="lg"
                      >
                        <Plus className="mr-2" size={20} />
                        Create First Task
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTasks.map((task: any) => {
                      const PriorityIcon = priorityConfig[task.priority as keyof typeof priorityConfig].icon;
                      const isExpanded = expandedTasks.has(task.id);
                      const notes = getTaskNotes(task.id);
                      const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
                      
                      return (
                        <div key={task.id} className={`relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                          task.status === 'completed' 
                            ? 'bg-gray-50/80 border-gray-200' 
                            : isOverdue 
                              ? 'bg-red-50/80 border-red-200' 
                              : 'bg-white/80 border-gray-200'
                        }`}>
                          {/* Priority indicator bar */}
                          <div className={`absolute left-0 top-0 w-1 h-full ${priorityConfig[task.priority as keyof typeof priorityConfig].color}`}></div>
                          
                          <div className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4 flex-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleComplete(task)}
                                  className={`mt-1 p-1 rounded-full ${
                                    task.status === 'completed' 
                                      ? 'text-green-600 bg-green-100' 
                                      : 'text-gray-400 hover:text-green-600 hover:bg-green-100'
                                  }`}
                                >
                                  <CheckCircle2 size={20} />
                                </Button>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-3 mb-3">
                                    <h3 className={`font-semibold text-lg ${
                                      task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'
                                    }`}>
                                      {task.title}
                                    </h3>
                                    
                                    <Badge className={priorityConfig[task.priority as keyof typeof priorityConfig].badge}>
                                      <PriorityIcon size={12} className="mr-1" />
                                      {task.priority}
                                    </Badge>
                                    
                                    {task.category && (
                                      <Badge variant="outline" className="bg-white/80">
                                        {task.category}
                                      </Badge>
                                    )}
                                    
                                    {isOverdue && (
                                      <Badge className="bg-red-100 text-red-700 border-red-200">
                                        <AlertTriangle size={12} className="mr-1" />
                                        Overdue
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                    <div className="space-y-2">
                                      {task.dueDate && (
                                        <div className="flex items-center space-x-2">
                                          <CalendarDays size={14} />
                                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                        </div>
                                      )}
                                      {task.assignedTo && (
                                        <div className="flex items-center space-x-2">
                                          <Avatar className="w-5 h-5">
                                            <AvatarFallback className="text-xs bg-blush/10 text-blush">
                                              {task.assignedTo.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span>Assigned to {task.assignedTo}</span>
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="space-y-2">
                                      {notes.length > 0 && (
                                        <div className="flex items-center space-x-2">
                                          <MessageSquare size={14} />
                                          <span>{notes.length} note{notes.length !== 1 ? 's' : ''}</span>
                                        </div>
                                      )}
                                      {task.description && (
                                        <div className="flex items-start space-x-2">
                                          <FileText size={14} className="mt-0.5" />
                                          <span className="line-clamp-2">{task.description}</span>
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center justify-end space-x-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleTaskExpansion(task.id)}
                                        className="text-gray-400 hover:text-gray-600"
                                      >
                                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                        {isExpanded ? 'Less' : 'More'}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                                    <MoreVertical size={16} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                  <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                    <Edit size={16} className="mr-2" />
                                    Edit Task
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleAddNote(task)}>
                                    <MessageSquare size={16} className="mr-2" />
                                    Add Note
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setSelectedTask(task)}>
                                    <UserPlus size={16} className="mr-2" />
                                    Assign Task
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => deleteTaskMutation.mutate(task.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 size={16} className="mr-2" />
                                    Delete Task
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            
                            {/* Expanded content */}
                            {isExpanded && (
                              <div className="mt-6 pt-6 border-t border-gray-200">
                                <Tabs defaultValue="details" className="w-full">
                                  <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                                    <TabsTrigger value="details">Details</TabsTrigger>
                                    <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
                                    <TabsTrigger value="activity">Activity</TabsTrigger>
                                  </TabsList>
                                  
                                  <TabsContent value="details" className="mt-4">
                                    <div className="space-y-4">
                                      {task.description && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-700 block mb-2">Description</label>
                                          <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{task.description}</p>
                                        </div>
                                      )}
                                      {task.notes && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-700 block mb-2">Notes</label>
                                          <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{task.notes}</p>
                                        </div>
                                      )}
                                      
                                      <div className="flex space-x-4">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleEditTask(task)}
                                          className="bg-white/80"
                                        >
                                          <Edit size={16} className="mr-2" />
                                          Edit Details
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleAddNote(task)}
                                          className="bg-white/80"
                                        >
                                          <MessageSquare size={16} className="mr-2" />
                                          Add Note
                                        </Button>
                                      </div>
                                    </div>
                                  </TabsContent>
                                  
                                  <TabsContent value="notes" className="mt-4">
                                    <div className="space-y-4">
                                      {notes.length === 0 ? (
                                        <div className="text-center py-8">
                                          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                          <p className="text-gray-600 mb-4">No notes yet for this task</p>
                                          <Button
                                            onClick={() => handleAddNote(task)}
                                            variant="outline"
                                            size="sm"
                                            className="bg-white/80"
                                          >
                                            <Plus size={16} className="mr-2" />
                                            Add First Note
                                          </Button>
                                        </div>
                                      ) : (
                                        <div className="space-y-3">
                                          {notes.map((note: any) => (
                                            <div key={note.id} className="bg-gray-50 p-4 rounded-lg">
                                              <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center space-x-2">
                                                  <Avatar className="w-6 h-6">
                                                    <AvatarFallback className="text-xs bg-blush/10 text-blush">
                                                      {note.authorName ? note.authorName.slice(0, 2).toUpperCase() : 'AN'}
                                                    </AvatarFallback>
                                                  </Avatar>
                                                  <span className="text-sm font-medium text-gray-700">
                                                    {note.authorName || 'Anonymous'}
                                                  </span>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                  {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Recently'}
                                                </span>
                                              </div>
                                              <p className="text-gray-600">{note.content}</p>
                                            </div>
                                          ))}
                                          <Button
                                            onClick={() => handleAddNote(task)}
                                            variant="outline"
                                            size="sm"
                                            className="w-full bg-white/80"
                                          >
                                            <Plus size={16} className="mr-2" />
                                            Add Another Note
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </TabsContent>
                                  
                                  <TabsContent value="activity" className="mt-4">
                                    <div className="text-center py-8">
                                      <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                      <p className="text-gray-600">Activity tracking coming soon</p>
                                    </div>
                                  </TabsContent>
                                </Tabs>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Add Task Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Sparkles className="text-blush" size={20} />
              <span>Create New Task</span>
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task title" {...field} />
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
                          {taskCategories.map(category => (
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
              </div>
              
              <div className="grid grid-cols-2 gap-4">
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
                          <SelectItem value="">Unassigned</SelectItem>
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
                      <Textarea placeholder="Enter task description" rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Add any initial notes" rows={2} {...field} />
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
                  {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
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
                          {taskCategories.map(category => (
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
              </div>
              
              <div className="grid grid-cols-2 gap-4">
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
                          <SelectItem value="">Unassigned</SelectItem>
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
                      <Textarea placeholder="Enter task description" rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Add any notes" rows={2} {...field} />
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

      {/* Add Note Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <MessageSquare className="text-blush" size={20} />
              <span>Add Note to Task</span>
            </DialogTitle>
          </DialogHeader>
          <Form {...noteForm}>
            <form onSubmit={noteForm.handleSubmit(onNoteSubmit)} className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Task: {selectedTask?.title}</p>
              </div>
              
              <FormField
                control={noteForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note Content *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter your note about this task..." 
                        rows={4} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsNotesDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={addNoteMutation.isPending}
                  className="gradient-blush-rose text-white"
                >
                  <Send size={16} className="mr-2" />
                  {addNoteMutation.isPending ? "Adding..." : "Add Note"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <MobileNav />
    </div>
  );
}