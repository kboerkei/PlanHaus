import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { EnhancedButton } from "@/components/ui/enhanced-button";
import { EnhancedInput } from "@/components/ui/enhanced-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { trackWeddingEvent } from "@/lib/analytics";

const addExpenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0").max(999999, "Amount is too large"),
  category: z.string().default("other"),
  vendor: z.string().optional(),
  date: z.string().default(() => new Date().toISOString().split("T")[0]),
  isPaid: z.boolean().default(false),
  notes: z.string().optional(),
});

type AddExpenseFormData = z.infer<typeof addExpenseSchema>;

interface AddExpenseFormProps {
  projectId: number;
  onSuccess?: () => void;
}

export default function AddExpenseForm({ projectId, onSuccess }: AddExpenseFormProps): JSX.Element {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AddExpenseFormData>({
    resolver: zodResolver(addExpenseSchema),
    defaultValues: {
      description: "",
      amount: 0,
      category: "other",
      vendor: "",
      date: new Date().toISOString().split("T")[0],
      isPaid: false,
      notes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: AddExpenseFormData & { projectId: number }) => {
      const response = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to add expense");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      trackWeddingEvent.addExpense(data.amount, data.category);
      toast({
        title: "Success",
        description: "Expense added successfully",
      });
      form.reset();
      void queryClient.invalidateQueries({ queryKey: ["/api/budget"] });
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

  const onSubmit = (data: AddExpenseFormData): void => {
    mutation.mutate({ ...data, projectId });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <EnhancedInput
                  {...field}
                  placeholder="Wedding venue deposit"
                  error={form.formState.errors.description?.message}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount *</FormLabel>
              <FormControl>
                <EnhancedInput
                  {...field}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  value={field.value || ""}
                  error={form.formState.errors.amount?.message}
                />
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
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vendor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendor</FormLabel>
              <FormControl>
                <EnhancedInput
                  {...field}
                  placeholder="Vendor name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <EnhancedInput
                  {...field}
                  type="date"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPaid"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Paid</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <EnhancedButton
          type="submit"
          variant="wedding"
          loading={mutation.isPending}
          loadingText="Adding Expense..."
          disabled={mutation.isPending}
        >
          Add Expense
        </EnhancedButton>
      </form>
    </Form>
  );
}