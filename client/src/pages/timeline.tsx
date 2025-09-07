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
import UnifiedPageLayout from "@/components/layout/UnifiedPageLayout";
import { UnifiedSection, UnifiedGrid, UnifiedCard } from "@/components/layout/UnifiedSection";

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

  // Performance monitoring
  usePerformanceMonitor('Timeline');

  // Fetch data using hooks
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const currentProject = Array.isArray(projects) 
    ? projects.find((p: any) => p.name === "Emma & Jake's Wedding") || projects[0] 
    : null;
  const projectId = currentProject?.id?.toString();
  
  const { data: tasks = [], isLoading: tasksLoading, error: tasksError } = useTasks(projectId);
  const weddingDate = currentProject?.weddingDate ? new Date(currentProject.weddingDate) : null;

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

  // Calculate stats
  const stats = useMemo(() => {
    if (!tasks) return { total: 0, completed: 0, pending: 0, overdue: 0 };
    
    const now = new Date();
    return {
      total: tasks.length,
      completed: tasks.filter((task: any) => task.status === 'completed' || task.isCompleted).length,
      pending: tasks.filter((task: any) => task.status !== 'completed' && !task.isCompleted).length,
      overdue: tasks.filter((task: any) => 
        task.dueDate && new Date(task.dueDate) < now && (task.status !== 'completed' && !task.isCompleted)
      ).length,
    };
  }, [tasks]);

  // Loading and error states
  if (projectsLoading || tasksLoading) {
    return (
      <UnifiedPageLayout title="Timeline & Tasks" subtitle="Stay on track with your wedding timeline">
        <UnifiedSection animation="fadeIn" margin="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </UnifiedSection>
      </UnifiedPageLayout>
    );
  }

  if (tasksError) {
    return (
      <UnifiedPageLayout title="Timeline & Tasks" subtitle="Stay on track with your wedding timeline">
        <UnifiedSection animation="fadeIn" margin="lg">
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Tasks</h3>
            <p className="text-gray-600 mb-4">Unable to load timeline information. Please try again.</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </UnifiedSection>
      </UnifiedPageLayout>
    );
  }

  if (!projectId) {
    return (
      <UnifiedPageLayout title="Timeline & Tasks" subtitle="Stay on track with your wedding timeline">
        <UnifiedSection animation="fadeIn" margin="lg">
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Wedding Project Found</h3>
            <p className="text-gray-600 mb-4">Please create a project first to start planning your wedding.</p>
                         <TaskFormDialog
               projectId={projectId || ""}
               trigger={
                 <Button className="flex items-center gap-2">
                   <Zap className="w-4 h-4" />
                   Create Wedding Project
                 </Button>
               }
             />
          </div>
        </UnifiedSection>
      </UnifiedPageLayout>
    );
  }

  return (
    <UnifiedPageLayout 
      title="Timeline & Tasks" 
      subtitle="Stay on track with your wedding timeline"
      animation="fadeIn"
    >
      {/* Stats Section */}
      <UnifiedSection animation="slideUp" margin="lg">
        <UnifiedGrid cols={4}>
          <UnifiedCard variant="wedding">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </UnifiedCard>
          
          <UnifiedCard variant="wedding">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </UnifiedCard>
          
          <UnifiedCard variant="wedding">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                <Clock className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </UnifiedCard>
          
          <UnifiedCard variant="wedding">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-red-100 text-red-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
              </div>
            </div>
          </UnifiedCard>
        </UnifiedGrid>
      </UnifiedSection>

      {/* Filters and Actions */}
      <UnifiedSection animation="slideUp" margin="lg">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                {priorityFilters.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categoryFilters.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-completed"
                checked={showCompleted}
                onCheckedChange={(checked) => setShowCompleted(checked as boolean)}
              />
              <label htmlFor="show-completed" className="text-sm text-gray-600">
                Show completed
              </label>
            </div>
            
            <TaskFormDialog
              projectId={projectId}
              trigger={
                <Button className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Add Task
                </Button>
              }
            />
            
            <ExportDialog
              projectId={projectId || ""}
              projectName={currentProject?.name || "Wedding Project"}
              trigger={
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              }
            />
          </div>
        </div>
      </UnifiedSection>

      {/* Timeline Content */}
      <UnifiedSection animation="slideUp" margin="lg">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chronological">Chronological View</TabsTrigger>
            <TabsTrigger value="category">Category View</TabsTrigger>
          </TabsList>

          <TabsContent value="chronological" className="space-y-4">
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
          <TabsContent value="category" className="space-y-4">
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
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterPriority !== "all" || filterCategory !== "all"
                ? "Try adjusting your filters to see more results."
                : "Start planning your wedding by adding your first task."}
            </p>
            {!searchTerm && filterPriority === "all" && filterCategory === "all" && (
              <TaskFormDialog
                projectId={projectId}
                trigger={
                  <Button className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Add Your First Task
                  </Button>
                }
              />
            )}
          </div>
        )}
      </UnifiedSection>
    </UnifiedPageLayout>
  );
}