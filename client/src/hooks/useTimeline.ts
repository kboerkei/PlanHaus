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
    mutationFn: (data: TaskFormData) => apiRequest('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        projectId: parseInt(projectId),
        status: 'pending',
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null
      }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });
}

export function useUpdateTask(projectId: string) {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TaskFormData> }) =>
      apiRequest(`/api/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          ...data,
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });
}

export function useCompleteTask(projectId: string) {
  return useMutation({
    mutationFn: ({ id, isCompleted }: { id: number; isCompleted: boolean }) =>
      apiRequest(`/api/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          status: isCompleted ? 'completed' : 'pending',
          isCompleted 
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });
}

export function useDeleteTask(projectId: string) {
  return useMutation({
    mutationFn: (id: number) => apiRequest(`/api/tasks/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });
}