import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { TaskFormData } from "@/schemas";

export function useTasks(projectId?: string) {
  return useQuery({
    queryKey: projectId ? ['/api/projects', projectId, 'tasks'] : ['/api/tasks'],
    enabled: !!projectId,
  });
}

export function useCreateTask(projectId: string) {
  return useMutation({
    mutationFn: (data: TaskFormData) => 
      apiRequest(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    }
  });
}

export function useUpdateTask(projectId: string) {
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<TaskFormData> }) => 
      apiRequest(`/api/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    }
  });
}

export function useDeleteTask(projectId: string) {
  return useMutation({
    mutationFn: (id: string) => 
      apiRequest(`/api/tasks/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    }
  });
}

export function useCompleteTask(projectId: string) {
  return useMutation({
    mutationFn: ({ id, isCompleted }: { id: string, isCompleted: boolean }) => 
      apiRequest(`/api/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isCompleted }),
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    }
  });
}