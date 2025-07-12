import { AlertTriangle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Final headcount to caterer',
    dueDate: 'Due tomorrow',
    priority: 'high',
    completed: false,
  },
  {
    id: '2',
    title: 'Schedule hair & makeup trial',
    dueDate: 'Due Friday',
    priority: 'medium',
    completed: false,
  },
  {
    id: '3',
    title: 'Confirm transportation',
    dueDate: 'Due next week',
    priority: 'medium',
    completed: false,
  },
  {
    id: '4',
    title: 'Book photographer',
    dueDate: 'Completed yesterday',
    priority: 'high',
    completed: true,
  },
];

export default function UpcomingTasks() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg font-semibold text-gray-800">Upcoming Tasks</h3>
        <span className="text-sm text-gray-500">This Week</span>
      </div>
      
      <div className="space-y-3">
        {mockTasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              "flex items-center space-x-3 p-3 rounded-lg transition-colors",
              task.completed
                ? "bg-green-50 border border-green-200"
                : task.priority === 'high'
                ? "border border-orange-200 bg-orange-50"
                : "hover:bg-gray-50"
            )}
          >
            <div
              className={cn(
                "w-4 h-4 rounded border-2 flex items-center justify-center",
                task.completed
                  ? "bg-green-500 border-green-500"
                  : task.priority === 'high'
                  ? "border-orange-400"
                  : "border-gray-300"
              )}
            >
              {task.completed && <Check className="text-white" size={12} />}
            </div>
            <div className="flex-1">
              <p className={cn(
                "font-medium text-gray-800",
                task.completed && "line-through"
              )}>
                {task.title}
              </p>
              <p className={cn(
                "text-sm",
                task.completed
                  ? "text-green-600"
                  : task.priority === 'high'
                  ? "text-orange-600"
                  : "text-gray-600"
              )}>
                {task.dueDate}
              </p>
            </div>
            {!task.completed && task.priority === 'high' && (
              <AlertTriangle className="text-orange-500" size={16} />
            )}
          </div>
        ))}
      </div>
      
      <Button variant="ghost" className="w-full mt-4 text-blush hover:bg-gray-50">
        View All Tasks
      </Button>
    </div>
  );
}
