import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { taskSchema, TaskFormData } from "@/schemas";
import { useCreateTask, useUpdateTask } from "@/hooks/useTimeline";
import { useToast } from "@/hooks/use-toast";

interface TaskFormDialogProps {
  projectId: string;
  task?: any;
  trigger?: React.ReactNode;
  onClose?: () => void;
}

export default function TaskFormDialog({ projectId, task, trigger, onClose }: TaskFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const createTask = useCreateTask(projectId);
  const updateTask = useUpdateTask(projectId);

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      dueDate: task?.dueDate || "",
      priority: task?.priority || "medium",
      category: task?.category || "planning",
      assignedTo: task?.assignedTo || "",
      isCompleted: task?.isCompleted || false,
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    try {
      if (task) {
        await updateTask.mutateAsync({ id: task.id, data });
        toast({ title: "Task updated successfully!" });
      } else {
        await createTask.mutateAsync(data);
        toast({ title: "Task created successfully!" });
      }
      form.reset();
      setIsOpen(false);
      onClose?.();
    } catch (error) {
      toast({
        title: "Error",
        description: task ? "Failed to update task" : "Failed to create task",
        variant: "destructive"
      });
    }
  };

  const defaultTrigger = (
    <Button className="gradient-blush-rose text-white">
      <Plus className="w-4 h-4 mr-2" />
      Add Task
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]" aria-describedby="task-form-description">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add New Task"}</DialogTitle>
          <DialogDescription id="task-form-description">
            {task ? "Update the task details below." : "Create a new task for your wedding timeline."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task title..." {...field} />
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
                    <Textarea placeholder="Enter task description..." {...field} />
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
                        <SelectItem value="venue">Venue</SelectItem>
                        <SelectItem value="catering">Catering</SelectItem>
                        <SelectItem value="photography">Photography</SelectItem>
                        <SelectItem value="flowers">Flowers</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="attire">Attire</SelectItem>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
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
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
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
                    <FormLabel>Assigned To</FormLabel>
                    <FormControl>
                      <Input placeholder="Person responsible..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createTask.isPending || updateTask.isPending}
                className="gradient-blush-rose text-white"
              >
                {createTask.isPending || updateTask.isPending ? "Saving..." : (task ? "Update Task" : "Create Task")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}