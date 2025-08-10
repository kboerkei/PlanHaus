import React, { useEffect, useRef, useCallback } from "react";
import { useForm, UseFormProps, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ZodSchema, z } from "zod";
import { useDebouncedCallback } from "use-debounce";

interface AutosaveOptions<T> {
  // Autosave configuration
  enabled?: boolean;
  debounceMs?: number;
  saveOnBlur?: boolean;
  
  // API configuration
  saveEndpoint?: string;
  updateEndpoint?: string;
  queryKey?: string[];
  
  // Callbacks
  onSaveStart?: (data: T) => void;
  onSaveSuccess?: (data: T, response: any) => void;
  onSaveError?: (data: T, error: any) => void;
  
  // Data transformation
  transformBeforeSave?: (data: T) => any;
  getId?: (data: T) => string | number | undefined;
}

interface FormWithAutosaveOptions<T extends Record<string, any>> extends UseFormProps<T> {
  schema: ZodSchema<T>;
  autosave?: AutosaveOptions<T>;
}

export function useFormWithAutosave<T extends Record<string, any>>({
  schema,
  autosave = {},
  ...formOptions
}: FormWithAutosaveOptions<T>): UseFormReturn<T> & {
  saveManually: () => void;
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
} {
  const queryClient = useQueryClient();
  const lastSavedRef = useRef<Date | null>(null);
  const hasUnsavedChangesRef = useRef(false);
  const initialDataRef = useRef<T | null>(null);

  // Initialize form with zodResolver
  const form = useForm<T>({
    resolver: zodResolver(schema),
    mode: "onChange",
    ...formOptions,
  });

  const { watch, getValues, formState } = form;

  // Store initial data for comparison
  useEffect(() => {
    if (formOptions.defaultValues && !initialDataRef.current) {
      initialDataRef.current = formOptions.defaultValues as T;
    }
  }, [formOptions.defaultValues]);

  // Mutation for saving data
  const saveMutation = useMutation({
    mutationFn: async (data: T) => {
      autosave.onSaveStart?.(data);
      
      const transformedData = autosave.transformBeforeSave?.(data) || data;
      const id = autosave.getId?.(data);
      
      let response;
      if (id && autosave.updateEndpoint) {
        // Update existing record
        response = await apiRequest(autosave.updateEndpoint.replace(':id', String(id)), {
          method: 'PATCH',
          body: JSON.stringify(transformedData),
        });
      } else if (autosave.saveEndpoint) {
        // Create new record
        response = await apiRequest(autosave.saveEndpoint, {
          method: 'POST',
          body: JSON.stringify(transformedData),
        });
      } else {
        throw new Error('No save endpoint configured');
      }
      
      return response;
    },
    onSuccess: (response, data) => {
      lastSavedRef.current = new Date();
      hasUnsavedChangesRef.current = false;
      
      // Optimistic toast
      toast({
        title: "Saved",
        description: "Your changes have been saved automatically",
        variant: "default",
      });
      
      // Invalidate related queries
      if (autosave.queryKey) {
        queryClient.invalidateQueries({ queryKey: autosave.queryKey });
      }
      
      autosave.onSaveSuccess?.(data, response);
    },
    onError: (error, data) => {
      toast({
        title: "Save Failed",
        description: "Unable to save changes. Please try again.",
        variant: "destructive",
      });
      
      autosave.onSaveError?.(data, error);
    },
  });

  // Debounced save function
  const debouncedSave = useDebouncedCallback((data: T) => {
    if (autosave.enabled && hasUnsavedChangesRef.current) {
      saveMutation.mutate(data);
    }
  }, autosave.debounceMs || 2000);

  // Manual save function
  const saveManually = useCallback(() => {
    const data = getValues();
    if (hasUnsavedChangesRef.current) {
      saveMutation.mutate(data);
    }
  }, [getValues, saveMutation]);

  // Watch for changes and trigger autosave
  useEffect(() => {
    if (!autosave.enabled) return;

    const subscription = watch((data) => {
      // Check if data has actually changed
      const hasChanged = JSON.stringify(data) !== JSON.stringify(initialDataRef.current);
      hasUnsavedChangesRef.current = hasChanged;

      if (hasChanged && formState.isValid) {
        debouncedSave(data as T);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, debouncedSave, formState.isValid, autosave.enabled]);

  // Save on blur if enabled
  useEffect(() => {
    if (!autosave.enabled || !autosave.saveOnBlur) return;

    const handleBlur = () => {
      if (hasUnsavedChangesRef.current && formState.isValid) {
        const data = getValues();
        saveMutation.mutate(data);
      }
    };

    // Add blur listeners to form fields
    const formElement = document.querySelector('form');
    if (formElement) {
      formElement.addEventListener('focusout', handleBlur);
      return () => formElement.removeEventListener('focusout', handleBlur);
    }
  }, [getValues, saveMutation, formState.isValid, autosave.enabled, autosave.saveOnBlur]);

  // Save before page unload
  useEffect(() => {
    if (!autosave.enabled) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChangesRef.current) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [autosave.enabled]);

  return {
    ...form,
    saveManually,
    isSaving: saveMutation.isPending,
    lastSaved: lastSavedRef.current,
    hasUnsavedChanges: hasUnsavedChangesRef.current,
  };
}

