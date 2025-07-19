import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Edit2, Trash2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useCompleteTask, useDeleteTask } from "@/hooks/useTimeline";
import { useToast } from "@/hooks/use-toast";
import TaskFormDialog from "./TaskFormDialog";

interface TaskCardProps {
  task: any;
  projectId: string;
}

export default function TaskCard({ task, projectId }: TaskCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const { toast } = useToast();
  const completeTask = useCompleteTask(projectId);
  const deleteTask = useDeleteTask(projectId);

  const handleToggleComplete = async () => {
    try {
      const isCurrentlyCompleted = task.status === 'completed' || task.isCompleted;
      await completeTask.mutateAsync({ 
        id: task.id, 
        isCompleted: !isCurrentlyCompleted 
      });
      toast({ 
        title: isCurrentlyCompleted ? "Task marked as incomplete" : "Task completed!" 
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask.mutateAsync(task.id);
      toast({ title: "Task deleted successfully" });
      setShowConfirmDelete(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      venue: "bg-purple-100 text-purple-800",
      catering: "bg-orange-100 text-orange-800",
      photography: "bg-blue-100 text-blue-800",
      flowers: "bg-pink-100 text-pink-800",
      music: "bg-indigo-100 text-indigo-800",
      attire: "bg-rose-100 text-rose-800",
      planning: "bg-gray-100 text-gray-800",
      other: "bg-slate-100 text-slate-800"
    };
    return colors[category] || colors.other;
  };

  const isCompleted = task.status === 'completed' || task.isCompleted;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;

  return (
    <Card className={`transition-all hover:shadow-md ${isCompleted ? 'opacity-75' : ''} ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={handleToggleComplete}
            disabled={completeTask.isPending}
            className="mt-1"
            aria-label={`Mark task "${task.title}" as ${isCompleted ? 'incomplete' : 'complete'}`}
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className={`font-medium text-gray-900 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                {task.title}
              </h3>
              
              <div className="flex items-center gap-1 flex-shrink-0">
                {isOverdue && <AlertCircle className="w-4 h-4 text-red-500" />}
                
                <TaskFormDialog
                  projectId={projectId}
                  task={task}
                  trigger={
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0"
                      aria-label={`Edit task "${task.title}"`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  }
                />
                
                {showConfirmDelete ? (
                  <div className="flex gap-1">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={handleDelete}
                      disabled={deleteTask.isPending}
                    >
                      Confirm
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setShowConfirmDelete(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    onClick={() => setShowConfirmDelete(true)}
                    aria-label={`Delete task "${task.title}"`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {task.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Badge variant="outline" className={getCategoryColor(task.category)}>
                {task.category}
              </Badge>
              
              <Badge variant="outline" className={getPriorityColor(task.priority)}>
                {task.priority} priority
              </Badge>

              {task.dueDate && (
                <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                  <Calendar className="w-3 h-3" />
                  {format(new Date(task.dueDate), 'MMM d, yyyy')}
                </div>
              )}

              {task.assignedTo && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <User className="w-3 h-3" />
                  {task.assignedTo}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}