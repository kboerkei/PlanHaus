import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { GuestFormData } from "@/schemas";

export function useGuests(projectId?: string) {
  return useQuery({
    queryKey: projectId ? ['/api/projects', projectId, 'guests'] : ['/api/guests'],
    enabled: !!projectId,
  });
}

export function useCreateGuest(projectId: string) {
  return useMutation({
    mutationFn: (data: GuestFormData) => 
      apiRequest(`/api/projects/${projectId}/guests`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'guests'] });
    }
  });
}

export function useUpdateGuest(projectId: string) {
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<GuestFormData> }) => 
      apiRequest(`/api/guests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'guests'] });
    }
  });
}

export function useDeleteGuest(projectId: string) {
  return useMutation({
    mutationFn: (id: string) => 
      apiRequest(`/api/guests/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'guests'] });
    }
  });
}

export function useBulkUpdateGuests(projectId: string) {
  return useMutation({
    mutationFn: (updates: { ids: string[], data: Partial<GuestFormData> }) => 
      apiRequest(`/api/projects/${projectId}/guests/bulk`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'guests'] });
    }
  });
}