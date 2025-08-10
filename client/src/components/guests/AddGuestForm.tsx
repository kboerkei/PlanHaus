import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { EnhancedButton } from "@/components/ui/enhanced-button";
import { EnhancedInput } from "@/components/ui/enhanced-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { trackWeddingEvent } from "@/lib/analytics";

const addGuestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  phone: z.string().regex(/^\+?[\d\s\-()]+$/, "Invalid phone number format").optional().or(z.literal("")),
  group: z.string().default("family"),
  partySize: z.number().min(1).default(1),
  rsvpStatus: z.string().default("pending"),
  address: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  notes: z.string().optional(),
});

type AddGuestFormData = z.infer<typeof addGuestSchema>;

interface AddGuestFormProps {
  projectId: number;
  onSuccess?: () => void;
}

export default function AddGuestForm({ projectId, onSuccess }: AddGuestFormProps): JSX.Element {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AddGuestFormData>({
    resolver: zodResolver(addGuestSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      group: "family",
      partySize: 1,
      rsvpStatus: "pending",
      address: "",
      dietaryRestrictions: "",
      notes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: AddGuestFormData & { projectId: number }) => {
      const response = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to add guest");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      trackWeddingEvent.addGuest(data.partySize || 1);
      toast({
        title: "Success",
        description: "Guest added successfully",
      });
      form.reset();
      void queryClient.invalidateQueries({ queryKey: ["/api/guests"] });
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

  const onSubmit = (data: AddGuestFormData): void => {
    mutation.mutate({ ...data, projectId });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <EnhancedInput
                  {...field}
                  placeholder="Guest name"
                  error={form.formState.errors.name?.message}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <EnhancedInput
                  {...field}
                  type="email"
                  placeholder="guest@example.com"
                  error={form.formState.errors.email?.message}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <EnhancedInput
                  {...field}
                  placeholder="+1 (555) 123-4567"
                  error={form.formState.errors.phone?.message}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="group"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="friends">Friends</SelectItem>
                  <SelectItem value="coworkers">Coworkers</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="partySize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Party Size</FormLabel>
              <FormControl>
                <EnhancedInput
                  {...field}
                  type="number"
                  min={1}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <EnhancedButton
          type="submit"
          variant="wedding"
          loading={mutation.isPending}
          loadingText="Adding Guest..."
          disabled={mutation.isPending}
        >
          Add Guest
        </EnhancedButton>
      </form>
    </Form>
  );
}