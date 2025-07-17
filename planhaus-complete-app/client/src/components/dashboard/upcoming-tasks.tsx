import { AlertTriangle, Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { Link } from "wouter";

export default function UpcomingTasks() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: projects } = useQuery({
    queryKey: ['/api/projects'],
    enabled: !!localStorage.getItem('sessionId')
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/projects', projects?.[0]?.id, 'tasks'],
    enabled: !!projects?.[0]?.id
  });

  const completeTaskMutation = useMutation({
    mutationFn: (taskId: number) => apiRequest(`/api/tasks/${taskId}/complete`, {
      method: 'POST'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({ title: "Task completed! Great progress!" });
    }
  });

  // Filter and sort upcoming tasks
  const upcomingTasks = tasks
    .filter(task => task.status !== 'completed')
    .filter(task => !task.dueDate || isBefore(new Date(), addDays(new Date(task.dueDate), 1)))
    .sort((a, b) => {
      // Sort by priority first, then by due date
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority] || 0;
      const bPriority = priorityOrder[b.priority] || 0;
      
      if (aPriority !== bPriority) return bPriority - aPriority;
      
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    })
    .slice(0, 4); // Show only top 4 tasks

  const recentlyCompleted = tasks
    .filter(task => task.status === 'completed')
    .slice(0, 2);

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = addDays(today, 1);
    
    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return 'Due today';
    } else if (format(date, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')) {
      return 'Due tomorrow';
    } else if (isBefore(date, today)) {
      return 'Overdue';
    } else {
      return `Due ${format(date, 'MMM d')}`;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg font-semibold text-gray-800">Tasks Overview</h3>
        <Link href="/timeline">
          <Button variant="ghost" size="sm" className="text-blush hover:bg-gray-50">
            View All
          </Button>
        </Link>
      </div>
      
      <div className="space-y-3">
        {upcomingTasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              "flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer",
              task.priority === 'high'
                ? "border border-orange-200 bg-orange-50"
                : "hover:bg-gray-50 border border-gray-100"
            )}
            onClick={() => completeTaskMutation.mutate(task.id)}
          >
            <div
              className={cn(
                "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
                task.priority === 'high'
                  ? "border-orange-400 hover:bg-orange-400 hover:border-orange-400"
                  : "border-gray-300 hover:bg-gray-300 hover:border-gray-300"
              )}
            >
              {completeTaskMutation.isPending && <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">
                {task.title}
              </p>
              <p className={cn(
                "text-sm",
                task.priority === 'high' && task.dueDate && isBefore(new Date(task.dueDate), new Date())
                  ? "text-red-600"
                  : task.priority === 'high'
                  ? "text-orange-600"
                  : "text-gray-600"
              )}>
                {task.dueDate ? formatDueDate(task.dueDate) : 'No due date'}
              </p>
            </div>
            {task.priority === 'high' && (
              <AlertTriangle className="text-orange-500" size={16} />
            )}
          </div>
        ))}
        
        {recentlyCompleted.length > 0 && (
          <>
            <div className="border-t pt-3 mt-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Recently Completed</p>
              {recentlyCompleted.map((task) => (
                <div key={task.id} className="flex items-center space-x-3 p-2 rounded-lg bg-green-50 border border-green-200">
                  <div className="w-4 h-4 rounded bg-green-500 border-green-500 flex items-center justify-center">
                    <Check className="text-white" size={12} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 line-through text-sm">{task.title}</p>
                    <p className="text-xs text-green-600">Completed</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      {upcomingTasks.length === 0 && (
        <div className="text-center py-8">
          <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">All caught up!</p>
          <p className="text-sm text-gray-500">No urgent tasks this week</p>
        </div>
      )}
      
      <Link href="/timeline">
        <Button variant="ghost" className="w-full mt-4 text-blush hover:bg-gray-50">
          <Plus size={16} className="mr-2" />
          Manage Tasks
        </Button>
      </Link>
    </div>
  );
}
