import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Plus, Clock, CheckCircle2, Circle, AlertCircle, Filter, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { format, isToday, isBefore, isAfter, addDays } from "date-fns";

interface Task {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed";
  dueDate: string | null;
  assignedTo: string | null;
  notes: string | null;
  projectId: number;
  createdBy: number;
  createdAt: string;
  completedAt: string | null;
  timeframeOrder: number | null;
  defaultTimeframe: string | null;
  isDefaultTask: boolean;
  customDate: string | null;
}

interface TimelineGroup {
  timeframe: string;
  order: number;
  tasks: Task[];
}

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800", 
  high: "bg-red-100 text-red-800"
};

const statusIcons = {
  pending: Circle,
  in_progress: Clock,
  completed: CheckCircle2
};

const statusColors = {
  pending: "text-gray-400",
  in_progress: "text-blue-500",
  completed: "text-green-500"
};

export default function TimelineAuto() {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      title: "",
      description: "",
      category: "",
      priority: "medium" as const,
      dueDate: "",
      assignedTo: "",
      notes: ""
    }
  });

  // Fetch tasks with automatic default loading
  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ["/api/tasks"],
    refetchOnWindowFocus: false
  });

  // Get current project
  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects"],
    refetchOnWindowFocus: false
  });

  const currentProject = projects[0];
  const weddingDate = currentProject?.date ? new Date(currentProject.date) : null;
  const daysUntilWedding = weddingDate ? Math.ceil((weddingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData)
      });
      if (!response.ok) throw new Error("Failed to create task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsAddDialogOpen(false);
      reset();
      toast.success("Task created successfully!");
    },
    onError: () => {
      toast.error("Failed to create task");
    }
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Task> }) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error("Failed to update task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast.success("Task updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update task");
    }
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to delete task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast.success("Task deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete task");
    }
  });

  // Group tasks by timeframe with chronological ordering
  const groupedTasks: TimelineGroup[] = tasks ? (() => {
    const groups: { [key: string]: TimelineGroup } = {};
    
    tasks.forEach((task: Task) => {
      const timeframe = task.defaultTimeframe || "Custom Tasks";
      const order = task.timeframeOrder || 999;
      
      if (!groups[timeframe]) {
        groups[timeframe] = {
          timeframe,
          order,
          tasks: []
        };
      }
      groups[timeframe].tasks.push(task);
    });

    // Sort groups by order (chronological - furthest to closest to wedding)
    return Object.values(groups).sort((a, b) => b.order - a.order);
  })() : [];

  // Filter tasks
  const getFilteredTasks = (tasks: Task[]) => {
    return tasks.filter(task => {
      const statusMatch = filter === "all" || 
        (filter === "completed" && task.status === "completed") ||
        (filter === "pending" && task.status === "pending") ||
        (filter === "overdue" && task.dueDate && isBefore(new Date(task.dueDate), new Date()) && task.status !== "completed") ||
        (filter === "this_week" && task.dueDate && 
          isAfter(new Date(task.dueDate), new Date()) && 
          isBefore(new Date(task.dueDate), addDays(new Date(), 7)));
      
      const categoryMatch = categoryFilter === "all" || task.category === categoryFilter;
      
      return statusMatch && categoryMatch;
    });
  };

  // Get unique categories
  const categories = tasks ? [...new Set(tasks.map((task: Task) => task.category).filter(Boolean))] : [];

  // Calculate stats
  const stats = tasks ? {
    total: tasks.length,
    completed: tasks.filter((t: Task) => t.status === "completed").length,
    pending: tasks.filter((t: Task) => t.status === "pending").length,
    overdue: tasks.filter((t: Task) => 
      t.dueDate && isBefore(new Date(t.dueDate), new Date()) && t.status !== "completed"
    ).length
  } : { total: 0, completed: 0, pending: 0, overdue: 0 };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // Toggle task completion
  const toggleTaskCompletion = (task: Task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    const updates = {
      status: newStatus,
      completedAt: newStatus === "completed" ? new Date().toISOString() : null
    };
    updateTaskMutation.mutate({ id: task.id, updates });
  };

  // Submit new task
  const onSubmit = (data: any) => {
    createTaskMutation.mutate({
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null
    });
  };

  // Toggle group expansion
  const toggleGroup = (timeframe: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(timeframe)) {
      newExpanded.delete(timeframe);
    } else {
      newExpanded.add(timeframe);
    }
    setExpandedGroups(newExpanded);
  };

  // Auto-expand all groups initially
  useEffect(() => {
    if (groupedTasks.length > 0) {
      setExpandedGroups(new Set(groupedTasks.map(g => g.timeframe)));
    }
  }, [groupedTasks.length]);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Timeline</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading timeline</h3>
              <p className="mt-1 text-sm text-gray-500">There was a problem loading your wedding timeline.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Timeline</h2>
          {weddingDate && daysUntilWedding !== null && (
            <p className="text-muted-foreground">
              {daysUntilWedding > 0 
                ? `${daysUntilWedding} days until your special day`
                : daysUntilWedding === 0 
                ? "Your wedding is today!"
                : "Congratulations on your recent wedding!"
              }
            </p>
          )}
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="title">Task Title</Label>
                <Input {...register("title", { required: true })} placeholder="Enter task title" />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea {...register("description")} placeholder="Enter task description" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={(value) => register("category").onChange({ target: { value } })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                      <SelectItem value="Budget & Planning">Budget & Planning</SelectItem>
                      <SelectItem value="Guest List & Invitations">Guest List & Invitations</SelectItem>
                      <SelectItem value="Ceremony">Ceremony</SelectItem>
                      <SelectItem value="Reception">Reception</SelectItem>
                      <SelectItem value="Decor & Design">Decor & Design</SelectItem>
                      <SelectItem value="Attire & Beauty">Attire & Beauty</SelectItem>
                      <SelectItem value="Photography & Videography">Photography & Videography</SelectItem>
                      <SelectItem value="Transportation & Logistics">Transportation & Logistics</SelectItem>
                      <SelectItem value="Legal & Documentation">Legal & Documentation</SelectItem>
                      <SelectItem value="Honeymoon & Travel">Honeymoon & Travel</SelectItem>
                      <SelectItem value="Post Wedding">Post Wedding</SelectItem>
                      <SelectItem value="Gifts & Favors">Gifts & Favors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select onValueChange={(value) => register("priority").onChange({ target: { value } })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input type="date" {...register("dueDate")} />
                </div>
                
                <div>
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Input {...register("assignedTo")} placeholder="Person responsible" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea {...register("notes")} placeholder="Additional notes" />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTaskMutation.isPending}>
                  {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {completionRate}% completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Circle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks ({stats.total})</SelectItem>
            <SelectItem value="pending">Pending ({stats.pending})</SelectItem>
            <SelectItem value="completed">Completed ({stats.completed})</SelectItem>
            <SelectItem value="overdue">Overdue ({stats.overdue})</SelectItem>
            <SelectItem value="this_week">Due This Week</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Timeline Groups */}
      <div className="space-y-6">
        {groupedTasks.map((group) => {
          const filteredTasks = getFilteredTasks(group.tasks);
          if (filteredTasks.length === 0) return null;
          
          const isExpanded = expandedGroups.has(group.timeframe);
          
          return (
            <Card key={group.timeframe}>
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleGroup(group.timeframe)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <CardTitle className="text-lg">{group.timeframe}</CardTitle>
                    <Badge variant="secondary">{filteredTasks.length} tasks</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {filteredTasks.filter(t => t.status === "completed").length} / {filteredTasks.length} completed
                  </div>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent>
                  <div className="space-y-3">
                    {filteredTasks.map((task: Task) => {
                      const StatusIcon = statusIcons[task.status];
                      const isOverdue = task.dueDate && isBefore(new Date(task.dueDate), new Date()) && task.status !== "completed";
                      
                      return (
                        <div key={task.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <Checkbox
                            checked={task.status === "completed"}
                            onCheckedChange={() => toggleTaskCompletion(task)}
                            className="flex-shrink-0"
                          />
                          
                          <StatusIcon className={`h-4 w-4 flex-shrink-0 ${statusColors[task.status]}`} />
                          
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium ${task.status === "completed" ? "line-through text-gray-500" : ""}`}>
                              {task.title}
                            </div>
                            {task.description && (
                              <div className="text-sm text-muted-foreground">{task.description}</div>
                            )}
                            <div className="flex items-center space-x-4 mt-1">
                              {task.category && (
                                <Badge variant="outline" className="text-xs">{task.category}</Badge>
                              )}
                              {task.priority && (
                                <Badge className={`text-xs ${priorityColors[task.priority]}`}>
                                  {task.priority}
                                </Badge>
                              )}
                              {task.dueDate && (
                                <span className={`text-xs ${isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
                                  Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                                  {isOverdue && " (Overdue)"}
                                </span>
                              )}
                              {task.assignedTo && (
                                <span className="text-xs text-muted-foreground">
                                  Assigned to: {task.assignedTo}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTaskMutation.mutate(task.id)}
                            className="flex-shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {groupedTasks.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CalendarDays className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding your first wedding planning task.
              </p>
              <div className="mt-6">
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}