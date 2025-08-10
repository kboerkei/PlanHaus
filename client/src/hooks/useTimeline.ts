import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { TaskFormData } from "@/schemas";
import type { Task, TaskInsert, TaskUpdate } from "@/types/task";

export function useTasks(projectId?: string) {
  return useQuery<Task[]>({
    queryKey: projectId ? ['/api/projects', projectId, 'tasks'] : ['/api/tasks'],
    queryFn: () => apiRequest<Task[]>(`/api/projects/${projectId}/tasks`),
    enabled: !!projectId,
  });
}

export function useCreateTask(projectId: string) {
  return useMutation({
    mutationFn: (data: TaskFormData) => apiRequest<Task>(`/api/projects/${projectId}/tasks`, {
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
    mutationFn: ({ id, data }: { id: number; data: TaskUpdate }) =>
      apiRequest<Task>(`/api/projects/${projectId}/tasks/${id}`, {
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
      apiRequest(`/api/projects/${projectId}/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          status: isCompleted ? 'completed' : 'not_started',
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
    mutationFn: (id: number) => apiRequest(`/api/projects/${projectId}/tasks/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });
}