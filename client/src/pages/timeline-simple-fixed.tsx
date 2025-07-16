import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import LoadingSpinner from "@/components/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Calendar, Plus, CheckCircle2, Clock, AlertTriangle, CalendarDays, Target, Users,
  Edit, Trash2, Filter, Search
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

type TaskFormData = z.infer<typeof taskSchema>;

const priorityConfig = {
  high: { 
    color: "bg-red-50 text-red-700 border-red-200",
    label: "High Priority"
  },
  medium: { 
    color: "bg-amber-50 text-amber-700 border-amber-200",
    label: "Medium Priority"
  },
  low: { 
    color: "bg-green-50 text-green-700 border-green-200",
    label: "Low Priority"
  }
};

const taskCategories = [
  "Venue", "Catering", "Photography", "Flowers", "Music", "Transportation", 
  "Attire", "Invitations", "Decorations", "Beauty", "Legal", "Other"
];

export default function TimelineSimple() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);
  const { toast } = useToast();

  // Fetch data
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/projects'],
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/tasks'],
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

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (data: TaskFormData) => apiRequest('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        projectId: currentProject?.id,
        status: 'pending',
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null
      }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task Created",
        description: "Your task has been added successfully",
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

  // Update task mutation
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

  // Delete task mutation
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

  // Toggle task completion
  const toggleTaskCompletion = (task: any) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateTaskMutation.mutate({
      id: task.id,
      data: { status: newStatus }
    });
  };

  // Calculate days until wedding
  const daysUntilWedding = weddingDate 
    ? Math.ceil((weddingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Helper functions
  const isOverdue = (task: any) => {
    if (!task.dueDate || task.status === 'completed') return false;
    return new Date(task.dueDate) < new Date();
  };

  const getDaysUntilDue = (task: any) => {
    if (!task.dueDate) return null;
    return Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };

  // Filter and organize tasks
  const filteredTasks = (tasks || []).filter((task: any) => {
    const matchesSearch = (task?.title || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = !filterPriority || task?.priority === filterPriority;
    const matchesCategory = !filterCategory || task?.category === filterCategory;
    const matchesCompleted = showCompleted || task?.status !== 'completed';
    
    return matchesSearch && matchesPriority && matchesCategory && matchesCompleted;
  });

  // Group tasks
  const pendingTasks = filteredTasks.filter(task => task.status !== 'completed');
  const completedTasks = filteredTasks.filter(task => task.status === 'completed');
  const overdueTasks = pendingTasks.filter(isOverdue);

  const onSubmit = (data: TaskFormData) => {
    createTaskMutation.mutate(data);
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    form.reset({
      title: task.title,
      description: task.description || "",
      category: task.category || "",
      priority: task.priority || "medium",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
      assignedTo: task.assignedTo || "",
      notes: task.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateTask = (data: TaskFormData) => {
    if (!editingTask) return;
    updateTaskMutation.mutate({
      id: editingTask.id,
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null
      }
    });
  };

  if (projectsLoading || tasksLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-3 sm:p-6 mobile-safe-spacing">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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
                    ? "Today is your wedding day!"
                    : daysUntilWedding !== null && daysUntilWedding < 0
                    ? "Congratulations on your recent wedding!"
                    : "Organize your perfect wedding journey"
                  }
                </p>
              </div>
            </div>
            
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="gradient-blush-rose text-white shadow-lg hover:shadow-xl"
              size="lg"
            >
              <Plus className="mr-2" size={20} />
              Add Task
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-64">
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {taskCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-completed"
                checked={showCompleted}
                onCheckedChange={setShowCompleted}
              />
              <label htmlFor="show-completed" className="text-sm">Show completed</label>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{pendingTasks.length}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{overdueTasks.length}</div>
                <div className="text-sm text-gray-600">Overdue</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Progress</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Task Lists */}
        <div className="space-y-6">
          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <Card className="border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="flex items-center text-red-700">
                  <AlertTriangle className="mr-2" size={20} />
                  Overdue Tasks ({overdueTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {overdueTasks.map((task: any) => (
                  <TaskCard 
                    key={task.id} 
                    task={task}
                    onToggle={() => toggleTaskCompletion(task)}
                    onEdit={() => handleEditTask(task)}
                    onDelete={() => deleteTaskMutation.mutate(task.id)}
                    getDaysUntilDue={getDaysUntilDue}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Pending Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2" size={20} />
                Pending Tasks ({pendingTasks.filter(t => !isOverdue(t)).length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingTasks.filter(t => !isOverdue(t)).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CalendarDays className="mx-auto mb-4" size={48} />
                  <p>No pending tasks</p>
                </div>
              ) : (
                pendingTasks.filter(t => !isOverdue(t)).map((task: any) => (
                  <TaskCard 
                    key={task.id} 
                    task={task}
                    onToggle={() => toggleTaskCompletion(task)}
                    onEdit={() => handleEditTask(task)}
                    onDelete={() => deleteTaskMutation.mutate(task.id)}
                    getDaysUntilDue={getDaysUntilDue}
                  />
                ))
              )}
            </CardContent>
          </Card>

          {/* Completed Tasks */}
          {showCompleted && completedTasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-green-700">
                  <CheckCircle2 className="mr-2" size={20} />
                  Completed Tasks ({completedTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {completedTasks.map((task: any) => (
                  <TaskCard 
                    key={task.id} 
                    task={task}
                    onToggle={() => toggleTaskCompletion(task)}
                    onEdit={() => handleEditTask(task)}
                    onDelete={() => deleteTaskMutation.mutate(task.id)}
                    getDaysUntilDue={getDaysUntilDue}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Add Task Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {taskCategories.map(category => (
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
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="low">Low Priority</SelectItem>
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
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleUpdateTask)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Title *</FormLabel>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {taskCategories.map(category => (
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
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="low">Low Priority</SelectItem>
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

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="gradient-blush-rose text-white"
                    disabled={updateTaskMutation.isPending}
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

// Task Card Component
function TaskCard({ 
  task, 
  onToggle, 
  onEdit, 
  onDelete, 
  getDaysUntilDue 
}: { 
  task: any; 
  onToggle: () => void; 
  onEdit: () => void; 
  onDelete: () => void;
  getDaysUntilDue: (task: any) => number | null;
}) {
  const daysUntil = getDaysUntilDue(task);
  const isOverdue = daysUntil !== null && daysUntil < 0;
  const isDueSoon = daysUntil !== null && daysUntil >= 0 && daysUntil <= 3;

  return (
    <div className={`flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 ${
      task.status === 'completed' ? 'opacity-75' : ''
    } ${isOverdue ? 'border-red-200 bg-red-50' : isDueSoon ? 'border-amber-200 bg-amber-50' : 'border-gray-200'}`}>
      <Checkbox
        checked={task.status === 'completed'}
        onCheckedChange={onToggle}
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
            {task.title}
          </h4>
          <Badge className={priorityConfig[task.priority as keyof typeof priorityConfig]?.color || 'bg-gray-100'}>
            {task.priority}
          </Badge>
          {task.category && (
            <Badge variant="outline" className="text-xs">
              {task.category}
            </Badge>
          )}
        </div>
        
        {task.description && (
          <p className="text-sm text-gray-600 mb-1">{task.description}</p>
        )}
        
        {task.dueDate && (
          <div className="flex items-center text-xs text-gray-500">
            <Clock size={12} className="mr-1" />
            <span>
              Due: {new Date(task.dueDate).toLocaleDateString()}
              {daysUntil !== null && (
                <span className={`ml-2 ${isOverdue ? 'text-red-600 font-medium' : isDueSoon ? 'text-amber-600' : ''}`}>
                  ({isOverdue ? `${Math.abs(daysUntil)} days overdue` : 
                     daysUntil === 0 ? 'Due today' : 
                     `${daysUntil} days left`})
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-1">
        <Button size="sm" variant="ghost" onClick={onEdit}>
          <Edit size={14} />
        </Button>
        <Button size="sm" variant="ghost" onClick={onDelete} className="text-red-500 hover:text-red-700">
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
}