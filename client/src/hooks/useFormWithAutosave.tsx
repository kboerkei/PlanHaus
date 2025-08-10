import { useEffect, useCallback, useRef } from 'react';
import { UseFormReturn, FieldValues, FieldPath } from 'react-hook-form';
import { useDebouncedCallback } from 'use-debounce';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface UseFormWithAutosaveOptions<T extends FieldValues> {
  form: UseFormReturn<T>;
  saveEndpoint: string;
  saveData?: (data: T) => Partial<T>;
  debounceMs?: number;
  enabledFields?: Array<FieldPath<T>>;
  onSaveSuccess?: (data: unknown) => void;
  onSaveError?: (error: Error) => void;
}

interface AutosaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  saveCount: number;
}

export function useFormWithAutosave<T extends FieldValues>({
  form,
  saveEndpoint,
  saveData,
  debounceMs = 2000,
  enabledFields,
  onSaveSuccess,
  onSaveError,
}: UseFormWithAutosaveOptions<T>) {
  const { toast } = useToast();
  const autosaveState = useRef<AutosaveState>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    saveCount: 0,
  });

  const saveForm = useCallback(async (data: T) => {
    if (autosaveState.current.isSaving) return;

    try {
      autosaveState.current.isSaving = true;
      
      const payload = saveData ? saveData(data) : data;
      const result = await apiRequest(saveEndpoint, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      autosaveState.current.lastSaved = new Date();
      autosaveState.current.hasUnsavedChanges = false;
      autosaveState.current.saveCount++;

      toast({
        title: "Saved",
        description: "Your changes have been saved automatically",
        duration: 2000,
      });

      onSaveSuccess?.(result);
    } catch (error) {
      console.error('Autosave failed:', error);
      
      toast({
        title: "Save failed",
        description: "Your changes couldn't be saved. Please try again.",
        variant: "destructive",
        duration: 4000,
      });

      onSaveError?.(error as Error);
    } finally {
      autosaveState.current.isSaving = false;
    }
  }, [saveEndpoint, saveData, toast, onSaveSuccess, onSaveError]);

  const debouncedSave = useDebouncedCallback(saveForm, debounceMs);

  // Manual save function
  const manualSave = useCallback(async () => {
    const data = form.getValues();
    await saveForm(data);
  }, [form, saveForm]);

  // Watch for form changes
  useEffect(() => {
    const subscription = form.watch((data, { name }) => {
      // Skip autosave if field is not in enabled list
      if (enabledFields && name && !enabledFields.includes(name as FieldPath<T>)) {
        return;
      }

      // Mark as having unsaved changes
      autosaveState.current.hasUnsavedChanges = true;

      // Only autosave if form is valid
      if (form.formState.isValid) {
        debouncedSave(data as T);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, debouncedSave, enabledFields]);

  // Save on blur for long forms
  const handleBlur = useCallback(() => {
    if (autosaveState.current.hasUnsavedChanges && form.formState.isValid) {
      const data = form.getValues();
      saveForm(data);
    }
  }, [form, saveForm]);

  // Save when leaving the page
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (autosaveState.current.hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return {
    autosaveState: autosaveState.current,
    manualSave,
    handleBlur,
  };
}