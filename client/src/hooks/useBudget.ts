import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { BudgetFormData } from "@/schemas";

export function useBudget(projectId?: string) {
  return useQuery({
    queryKey: projectId ? ['/api/projects', projectId, 'budget'] : ['/api/budget'],
    enabled: !!projectId,
  });
}

export function useCreateBudgetItem(projectId: string) {
  return useMutation({
    mutationFn: (data: BudgetFormData) => apiRequest('/api/budget-items', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        projectId: parseInt(projectId),
      }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'budget'] });
      queryClient.invalidateQueries({ queryKey: ['/api/budget'] });
    },
  });
}

export function useUpdateBudgetItem(projectId: string) {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<BudgetFormData> }) =>
      apiRequest(`/api/budget-items/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'budget'] });
      queryClient.invalidateQueries({ queryKey: ['/api/budget'] });
    },
  });
}

export function useDeleteBudgetItem(projectId: string) {
  return useMutation({
    mutationFn: (id: number) => apiRequest(`/api/budget-items/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'budget'] });
      queryClient.invalidateQueries({ queryKey: ['/api/budget'] });
    },
  });
}

export function useBudgetSummary(projectId?: string) {
  const { data: budgetItems } = useBudget(projectId);
  
  if (!budgetItems) return null;
  
  const categories = budgetItems.reduce((acc: any, item: any) => {
    const category = item.category || 'other';
    if (!acc[category]) {
      acc[category] = {
        category,
        estimated: 0,
        actual: 0,
        items: 0,
      };
    }
    acc[category].estimated += item.estimatedCost || 0;
    acc[category].actual += item.actualCost || 0;
    acc[category].items += 1;
    return acc;
  }, {});
  
  const totalEstimated = Object.values(categories).reduce((sum: number, cat: any) => sum + cat.estimated, 0);
  const totalActual = Object.values(categories).reduce((sum: number, cat: any) => sum + cat.actual, 0);
  
  return {
    categories: Object.values(categories),
    totalEstimated,
    totalActual,
    totalRemaining: totalEstimated - totalActual,
    items: budgetItems.length,
  };
}