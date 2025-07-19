import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { BudgetFormData } from "@/schemas";

export function useBudget(projectId?: string) {
  return useQuery({
    queryKey: projectId ? ['/api/projects', projectId, 'budget'] : ['/api/budget'],
    enabled: !!projectId,
  });
}

export function useBudgetSummary(projectId?: string) {
  return useQuery({
    queryKey: projectId ? ['/api/projects', projectId, 'budget', 'summary'] : ['/api/budget/summary'],
    enabled: !!projectId,
  });
}

export function useCreateBudgetItem(projectId: string) {
  return useMutation({
    mutationFn: (data: BudgetFormData) => 
      apiRequest(`/api/projects/${projectId}/budget`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'budget'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'budget', 'summary'] });
    }
  });
}

export function useUpdateBudgetItem(projectId: string) {
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<BudgetFormData> }) => 
      apiRequest(`/api/budget-items/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'budget'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'budget', 'summary'] });
    }
  });
}

export function useDeleteBudgetItem(projectId: string) {
  return useMutation({
    mutationFn: (id: string) => 
      apiRequest(`/api/budget-items/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'budget'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'budget', 'summary'] });
    }
  });
}