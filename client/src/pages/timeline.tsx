import { useState, useMemo, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Calendar, CheckCircle, Clock, Filter, AlertCircle, Target, TrendingUp, Download } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTimeline";
import TaskFormDialog from "@/components/timeline/TaskFormDialog";
import TaskCard from "@/components/timeline/TaskCard";
import LoadingSpinner from "@/components/ui/loading-spinner";
import ExportDialog from "@/components/export/ExportDialog";

const priorityFilters = [
  { value: "all", label: "All Priorities" },
  { value: "high", label: "High Priority" },
  { value: "medium", label: "Medium Priority" },
  { value: "low", label: "Low Priority" }
];

const categoryFilters = [
  { value: "all", label: "All Categories" },
  { value: "venue", label: "Venue" },
  { value: "catering", label: "Catering" },
  { value: "photography", label: "Photography" },
  { value: "flowers", label: "Flowers" },
  { value: "music", label: "Music" },
  { value: "attire", label: "Attire" },
  { value: "planning", label: "Planning" },
  { value: "other", label: "Other" }
];

export default function Timeline() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showCompleted, setShowCompleted] = useState(true);

  // Fetch data using hooks
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const currentProject = Array.isArray(projects) 
    ? projects.find((p: any) => p.name === "Emma & Jake's Wedding") || projects[0] 
    : null;
  const projectId = currentProject?.id?.toString();
  
  const { data: tasks = [], isLoading: tasksLoading, error: tasksError } = useTasks(projectId);
  const weddingDate = currentProject?.date ? new Date(currentProject.date) : null;

  // Filter and search logic
  const filteredTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];
    
    return (tasks as any[]).filter((task: any) => {
      const matchesSearch = !searchTerm || 
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
      const matchesCategory = filterCategory === "all" || task.category === filterCategory;
      const isCompleted = task.status === 'completed' || task.isCompleted;
      const matchesCompletion = showCompleted || !isCompleted;
      
      return matchesSearch && matchesPriority && matchesCategory && matchesCompletion;
    });
  }, [tasks, searchTerm, filterPriority, filterCategory, showCompleted]);

  // Categorize tasks
  const pendingTasks = filteredTasks.filter((task: any) => task.status !== 'completed' && !task.isCompleted);
  const completedTasks = filteredTasks.filter((task: any) => task.status === 'completed' || task.isCompleted);
  const overdueTasks = pendingTasks.filter((task: any) => 
    task.dueDate && new Date(task.dueDate) < new Date()
  );
  const highPriorityTasks = pendingTasks.filter((task: any) => task.priority === 'high');
  
  // Calculate days until wedding
  const daysUntilWedding = weddingDate 
    ? differenceInDays(weddingDate, new Date())
    : null;

  // Loading and error states
  if (projectsLoading || tasksLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" text="Loading your wedding timeline..." />
      </div>
    );
  }

  if (tasksError) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <p>Error loading tasks. Please try again.</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-600">
          <p>No wedding project found. Please create a project first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-rose-600" />
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Timeline</h1>
            {weddingDate && daysUntilWedding !== null && (
              <span className="text-gray-500 text-sm">
                {daysUntilWedding > 0 
                  ? `${daysUntilWedding} days until your special day`
                  : daysUntilWedding === 0 
                    ? "Your wedding is today!"
                    : "Congratulations on your recent wedding!"
                }
              </span>
            )}
          </div>
        </div>
        <ExportDialog
          projectId={projectId}
          projectName={currentProject?.name || "Wedding Project"}
          trigger={
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Timeline
            </Button>
          }
        />
      </div>

      <div className="space-y-6">
        {/* Stats and Add Task */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800">Task Overview</h2>
            <TaskFormDialog projectId={projectId} />
          </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{pendingTasks.length}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card className="border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
          <Card className="border-red-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{overdueTasks.length}</div>
              <div className="text-sm text-gray-600">Overdue</div>
            </CardContent>
          </Card>
          <Card className="border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Array.isArray(tasks) && tasks.length > 0 ? Math.round((completedTasks.length / (tasks as any[]).length) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Progress</div>
            </CardContent>
          </Card>
        </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              {priorityFilters.map(filter => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categoryFilters.map(filter => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-completed"
              checked={showCompleted}
              onCheckedChange={(checked) => setShowCompleted(checked === true)}
            />
            <label htmlFor="show-completed" className="text-sm">
              Show completed
            </label>
          </div>
          </div>
        </div>

        {/* Task Lists */}
        <div className="space-y-6">
        {/* Overdue Tasks */}
        {overdueTasks.length > 0 && (
          <Card className="border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700">
                <AlertCircle className="mr-2 w-5 h-5" />
                Overdue Tasks ({overdueTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {overdueTasks.map((task: any) => (
                <TaskCard 
                  key={task.id} 
                  task={task}
                  projectId={projectId}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* High Priority Tasks */}
        {highPriorityTasks.filter((t: any) => !overdueTasks.includes(t)).length > 0 && (
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-700">
                <Target className="mr-2 w-5 h-5" />
                High Priority ({highPriorityTasks.filter((t: any) => !overdueTasks.includes(t)).length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {highPriorityTasks
                .filter((t: any) => !overdueTasks.includes(t))
                .map((task: any) => (
                  <TaskCard 
                    key={task.id} 
                    task={task}
                    projectId={projectId}
                  />
                ))}
            </CardContent>
          </Card>
        )}

        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 w-5 h-5" />
              Pending Tasks ({pendingTasks.filter((t: any) => !overdueTasks.includes(t) && t.priority !== 'high').length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingTasks.filter((t: any) => !overdueTasks.includes(t) && t.priority !== 'high').length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="mx-auto mb-4 w-12 h-12" />
                <p>No pending tasks</p>
                <p className="text-sm">Great job staying on top of your wedding planning!</p>
              </div>
            ) : (
              pendingTasks
                .filter((t: any) => !overdueTasks.includes(t) && t.priority !== 'high')
                .map((task: any) => (
                  <TaskCard 
                    key={task.id} 
                    task={task}
                    projectId={projectId}
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
                <CheckCircle className="mr-2 w-5 h-5" />
                Completed Tasks ({completedTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {completedTasks.map((task: any) => (
                <TaskCard 
                  key={task.id} 
                  task={task}
                  projectId={projectId}
                />
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="mx-auto mb-4 w-16 h-16 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterPriority || filterCategory 
                ? "Try adjusting your filters to see more tasks."
                : "Get started by adding your first wedding planning task."
              }
            </p>
            {(!searchTerm && !filterPriority && !filterCategory) && (
              <TaskFormDialog projectId={projectId} />
            )}
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}