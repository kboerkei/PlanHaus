import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { EnhancedButton } from "@/components/ui/enhanced-button";
import { EnhancedInput } from "@/components/ui/enhanced-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const addTaskSchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z.string().optional(),
  dueDate: z.string().refine((date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }, "Due date must be in the future"),
  priority: z.string().default("medium"),
  category: z.string().default("planning"),
  isCompleted: z.boolean().default(false),
});

type AddTaskFormData = z.infer<typeof addTaskSchema>;

interface AddTaskFormProps {
  projectId: number;
  onSuccess?: () => void;
}

export default function AddTaskForm({ projectId, onSuccess }: AddTaskFormProps): JSX.Element {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AddTaskFormData>({
    resolver: zodResolver(addTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      priority: "medium",
      category: "planning",
      isCompleted: false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: AddTaskFormData & { projectId: number }) => {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to add task");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Task added successfully",
      });
      form.reset();
      void queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddTaskFormData): void => {
    mutation.mutate({ ...data, projectId });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <EnhancedInput
                  {...field}
                  placeholder="Book wedding venue"
                  error={form.formState.errors.title?.message}
                />
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
                <Textarea
                  {...field}
                  placeholder="Task description (optional)"
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date *</FormLabel>
              <FormControl>
                <EnhancedInput
                  {...field}
                  type="date"
                  error={form.formState.errors.dueDate?.message}
                />
              </FormControl>
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
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
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

        <EnhancedButton
          type="submit"
          variant="wedding"
          loading={mutation.isPending}
          loadingText="Adding Task..."
          disabled={mutation.isPending}
        >
          Add Task
        </EnhancedButton>
      </form>
    </Form>
  );
}