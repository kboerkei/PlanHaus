import { useState } from "react";
import { useFormWithAutosave } from "@/hooks/useFormWithAutosave";
import { SaveStatusIndicator } from "@/components/forms/SaveStatusIndicator";
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
import {
  TextField,
  TextareaField,
  SelectField,
  DateField,
  CheckboxField,
} from "@/components/forms/FormField";

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

  const form = useFormWithAutosave<TaskFormData>({
    schema: taskSchema,
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      dueDate: task?.dueDate || "",
      priority: task?.priority || "medium",
      category: task?.category || "planning",
      assignedTo: task?.assignedTo || "",
      status: task?.status || "not_started",
      isCompleted: task?.isCompleted || false,
      notes: task?.notes || "",
      estimatedHours: task?.estimatedHours || undefined,
      actualHours: task?.actualHours || undefined,
    },
    autosave: {
      enabled: !!task, // Only enable autosave for editing existing tasks
      saveEndpoint: `/api/projects/${projectId}/tasks`,
      updateEndpoint: `/api/projects/${projectId}/tasks/:id`,
      queryKey: ['/api/projects', projectId, 'tasks'],
      getId: (data) => task?.id,
      transformBeforeSave: (data) => ({
        ...data,
        projectId: Number(projectId),
      }),
    },
  });

  const { control, handleSubmit, formState, saveManually, isSaving, lastSaved, hasUnsavedChanges } = form;

  const onSubmit = async (data: TaskFormData) => {
    try {
      const transformedData = {
        ...data,
        assignedTo: data.assignedTo || undefined,
      };
      
      if (task) {
        await updateTask.mutateAsync({ id: task.id, data: transformedData });
        toast({ title: "Task updated successfully!" });
      } else {
        await createTask.mutateAsync(transformedData);
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
          <div className="space-y-4">
            {task && (
              <SaveStatusIndicator
                isSaving={isSaving}
                lastSaved={lastSaved}
                hasUnsavedChanges={hasUnsavedChanges}
              />
            )}
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <TextField
              control={control}
              name="title"
              label="Title"
              placeholder="Enter task title..."
              required
            />

            <TextareaField
              control={control}
              name="description"
              label="Description"
              placeholder="Enter task description..."
              rows={3}
            />

            <div className="grid grid-cols-2 gap-4">
              <SelectField
                control={control}
                name="category"
                label="Category"
                options={[
                  { value: "planning", label: "Planning" },
                  { value: "venue", label: "Venue" },
                  { value: "catering", label: "Catering" },
                  { value: "photography", label: "Photography" },
                  { value: "flowers", label: "Flowers" },
                  { value: "music", label: "Music" },
                  { value: "attire", label: "Attire" },
                  { value: "invitations", label: "Invitations" },
                  { value: "decorations", label: "Decorations" },
                  { value: "other", label: "Other" },
                ]}
              />

              <SelectField
                control={control}
                name="priority"
                label="Priority"
                options={[
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <DateField
                control={control}
                name="dueDate"
                label="Due Date"
              />

              <TextField
                control={control}
                name="assignedTo"
                label="Assigned To"
                placeholder="Person responsible..."
              />
            </div>

            <TextareaField
              control={control}
              name="notes"
              label="Notes"
              placeholder="Additional notes or requirements..."
              rows={2}
            />

            <CheckboxField
              control={control}
              name="isCompleted"
              label="Mark as completed"
              description="Check if this task is finished"
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  onClose?.();
                }}
                disabled={createTask.isPending || updateTask.isPending}
              >
                Cancel
              </Button>
              {task && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={saveManually}
                  disabled={!hasUnsavedChanges || isSaving}
                >
                  {isSaving ? "Saving..." : "Save Now"}
                </Button>
              )}
              <Button
                type="submit"
                disabled={createTask.isPending || updateTask.isPending}
                className="gradient-blush-rose text-white"
              >
                {createTask.isPending || updateTask.isPending
                  ? "Saving..."
                  : task
                  ? "Update Task"
                  : "Create Task"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}