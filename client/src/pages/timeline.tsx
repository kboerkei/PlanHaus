import { useState, useMemo, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckCircle, Clock, Filter, AlertCircle, Target, TrendingUp, Download, Search, Zap, Music, UtensilsCrossed, Scissors, SignpostIcon } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTimeline";
import TaskFormDialog from "@/components/timeline/TaskFormDialog";
import TaskCard from "@/components/timeline/TaskCard";
import LoadingSpinner from "@/components/ui/loading-spinner";
import ExportDialog from "@/components/export/ExportDialog";
import { EnhancedErrorBoundary } from "@/components/ui/enhanced-error-boundary";
import { SkeletonCard } from "@/components/ui/enhanced-loading";
import { EnhancedCard, StatCard, ProgressCard } from "@/components/ui/enhanced-cards";
import { SearchInput } from "@/components/ui/enhanced-forms";
import { AccessibleButton } from "@/components/ui/accessibility-enhancements";
import { useDebounce, usePerformanceMonitor } from "@/hooks/usePerformanceOptimization";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

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
  { value: "diy", label: "DIY" },
  { value: "signage", label: "Signage" },
  { value: "other", label: "Other" }
];

const categoryIcons: Record<string, any> = {
  venue: Calendar,
  catering: UtensilsCrossed,
  photography: Target, // Using Target instead of Camera which isn't available
  flowers: Target, // Using Target instead of Flower which isn't available
  music: Music,
  attire: Scissors,
  planning: Target,
  diy: Zap,
  signage: SignpostIcon,
  other: Clock
};

export default function Timeline() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showCompleted, setShowCompleted] = useState(true);
  const [activeTab, setActiveTab] = useState("chronological");

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
  
  // Group tasks by category for category view
  const tasksByCategory = useMemo(() => {
    const categories: Record<string, any[]> = {};
    filteredTasks.forEach((task: any) => {
      const category = task.category || 'other';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(task);
    });
    return categories;
  }, [filteredTasks]);
  
  // Sort tasks chronologically by due date and timeframe order
  const chronologicalTasks = useMemo(() => {
    return [...filteredTasks].sort((a: any, b: any) => {
      // First sort by timeframe order if available
      if (a.timeframeOrder && b.timeframeOrder) {
        if (a.timeframeOrder !== b.timeframeOrder) {
          return a.timeframeOrder - b.timeframeOrder;
        }
      }
      
      // Then by due date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      
      // Tasks with due dates come before tasks without
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      
      // Finally by creation date
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [filteredTasks]);
  
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
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Timeline & Tasks", current: true }
        ]}
        className="mb-6"
      />
      
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

        {/* Task Lists with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chronological" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Chronological
            </TabsTrigger>
            <TabsTrigger value="category" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              By Category
            </TabsTrigger>
          </TabsList>

          {/* Chronological View */}
          <TabsContent value="chronological" className="space-y-6">
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

            {/* Upcoming Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 w-5 h-5" />
                  Upcoming Tasks ({chronologicalTasks.filter((t: any) => !overdueTasks.includes(t) && t.priority !== 'high' && t.status !== 'completed' && !t.isCompleted).length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {chronologicalTasks.filter((t: any) => 
                  !overdueTasks.includes(t) && 
                  t.priority !== 'high' && 
                  t.status !== 'completed' && 
                  !t.isCompleted
                ).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="mx-auto mb-4 w-12 h-12" />
                    <p>No upcoming tasks</p>
                    <p className="text-sm">Great job staying on top of your wedding planning!</p>
                  </div>
                ) : (
                  chronologicalTasks
                    .filter((t: any) => 
                      !overdueTasks.includes(t) && 
                      t.priority !== 'high' && 
                      t.status !== 'completed' && 
                      !t.isCompleted
                    )
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
          </TabsContent>

          {/* Category View */}
          <TabsContent value="category" className="space-y-6">
            {Object.entries(tasksByCategory).length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-gray-500">
                    <Target className="mx-auto mb-4 w-12 h-12" />
                    <p>No tasks found</p>
                    <p className="text-sm">Add some tasks to see them organized by category.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              Object.entries(tasksByCategory)
                .sort(([categoryA], [categoryB]) => {
                  // Sort categories by priority: overdue tasks first, then by category name
                  const aHasOverdue = tasksByCategory[categoryA].some((t: any) => 
                    t.dueDate && new Date(t.dueDate) < new Date()
                  );
                  const bHasOverdue = tasksByCategory[categoryB].some((t: any) => 
                    t.dueDate && new Date(t.dueDate) < new Date()
                  );
                  
                  if (aHasOverdue && !bHasOverdue) return -1;
                  if (!aHasOverdue && bHasOverdue) return 1;
                  
                  return categoryA.localeCompare(categoryB);
                })
                .map(([category, categoryTasks]) => {
                  const CategoryIcon = categoryIcons[category] || Clock;
                  const categoryLabel = categoryFilters.find(f => f.value === category)?.label || 
                    category.charAt(0).toUpperCase() + category.slice(1);
                  
                  const pendingInCategory = categoryTasks.filter((t: any) => 
                    t.status !== 'completed' && !t.isCompleted
                  );
                  const completedInCategory = categoryTasks.filter((t: any) => 
                    t.status === 'completed' || t.isCompleted
                  );
                  const overdueInCategory = categoryTasks.filter((t: any) => 
                    t.dueDate && new Date(t.dueDate) < new Date()
                  );

                  return (
                    <Card key={category} className={overdueInCategory.length > 0 ? "border-l-4 border-l-red-500" : ""}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center">
                            <CategoryIcon className="mr-2 w-5 h-5" />
                            <span>{categoryLabel}</span>
                            <Badge variant="secondary" className="ml-2">
                              {categoryTasks.length}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            {pendingInCategory.length > 0 && (
                              <Badge variant="outline" className="text-blue-600">
                                {pendingInCategory.length} pending
                              </Badge>
                            )}
                            {completedInCategory.length > 0 && (
                              <Badge variant="outline" className="text-green-600">
                                {completedInCategory.length} done
                              </Badge>
                            )}
                            {overdueInCategory.length > 0 && (
                              <Badge variant="destructive">
                                {overdueInCategory.length} overdue
                              </Badge>
                            )}
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Sort tasks within category: overdue first, then by priority, then by due date */}
                        {categoryTasks
                          .sort((a: any, b: any) => {
                            // Overdue tasks first
                            const aOverdue = a.dueDate && new Date(a.dueDate) < new Date();
                            const bOverdue = b.dueDate && new Date(b.dueDate) < new Date();
                            if (aOverdue && !bOverdue) return -1;
                            if (!aOverdue && bOverdue) return 1;

                            // Then by completion status (pending first)
                            const aCompleted = a.status === 'completed' || a.isCompleted;
                            const bCompleted = b.status === 'completed' || b.isCompleted;
                            if (!aCompleted && bCompleted) return -1;
                            if (aCompleted && !bCompleted) return 1;

                            // Then by priority
                            const priorityOrder = { high: 0, medium: 1, low: 2 };
                            const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3;
                            const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3;
                            if (aPriority !== bPriority) return aPriority - bPriority;

                            // Finally by due date
                            if (a.dueDate && b.dueDate) {
                              return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                            }
                            return 0;
                          })
                          .map((task: any) => (
                            <TaskCard 
                              key={task.id} 
                              task={task}
                              projectId={projectId}
                            />
                          ))}
                      </CardContent>
                    </Card>
                  );
                })
            )}
          </TabsContent>
        </Tabs>

        {/* Enhanced Empty State */}
        {filteredTasks.length === 0 && (
          <Card>
            <CardContent>
              {(searchTerm || filterPriority !== "all" || filterCategory !== "all") ? (
                <EmptyState
                  type="tasks"
                  context="filtered"
                />
              ) : (
                <EmptyState
                  type="tasks"
                  context="timeline"
                />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}