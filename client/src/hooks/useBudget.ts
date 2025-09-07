import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { BudgetItemFormData } from "@/schemas";
import type { BudgetItem, BudgetItemInsert, BudgetItemUpdate, BudgetSummary } from "@/types/budget";

export function useBudget(projectId?: string) {
  return useQuery<BudgetItem[]>({
    queryKey: ['/api/projects', projectId, 'budget'],
    queryFn: () => apiRequest<BudgetItem[]>(`/api/projects/${projectId}/budget`),
    enabled: !!projectId && projectId !== 'undefined',
    staleTime: 5 * 60 * 1000, // 5 minutes for budget data
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
  });
}

export function useCreateBudgetItem(projectId: string) {
  return useMutation({
    mutationFn: (data: BudgetItemInsert) => apiRequest<BudgetItem>(`/api/projects/${projectId}/budget`, {
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
    mutationFn: ({ id, data }: { id: number; data: BudgetItemUpdate }) =>
      apiRequest<BudgetItem>(`/api/projects/${projectId}/budget/${id}`, {
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
    mutationFn: (id: number) => apiRequest(`/api/projects/${projectId}/budget/${id}`, {
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
  
  if (!budgetItems || !Array.isArray(budgetItems) || budgetItems.length === 0) {
    return {
      categories: [],
      totalEstimated: 0,
      totalActual: 0,
      totalRemaining: 0,
      items: 0,
    };
  }
  
  const categories = budgetItems.reduce((acc: Record<string, { name: string; estimated: number; actual: number; items: BudgetItem[] }>, item: BudgetItem) => {
    // Only process items that have a valid category
    if (!item || !item.category) return acc;
    
    // Normalize category to lowercase for grouping, but keep original for display
    const categoryKey = item.category.toLowerCase();
    const categoryDisplay = item.category;
    
    if (!acc[categoryKey]) {
      acc[categoryKey] = {
        name: categoryDisplay,
        estimated: 0,
        actual: 0,
        items: [],
      };
    }
    
    // Parse string values to numbers, handling both string and number types
    const estimatedCost = typeof item.estimatedCost === 'string' 
      ? parseFloat(item.estimatedCost) || 0 
      : (item.estimatedCost || 0);
    const actualCost = typeof item.actualCost === 'string' 
      ? parseFloat(item.actualCost) || 0 
      : (item.actualCost || 0);
    
    acc[categoryKey].estimated += estimatedCost;
    acc[categoryKey].actual += actualCost;
    acc[categoryKey].items.push(item);
    return acc;
  }, {});
  
  const totalEstimated = Object.values(categories).reduce((sum: number, cat: any) => sum + (cat.estimated || 0), 0);
  const totalActual = Object.values(categories).reduce((sum: number, cat: any) => sum + (cat.actual || 0), 0);
  
  return {
    categories: Object.values(categories),
    totalEstimated: isNaN(totalEstimated) ? 0 : totalEstimated,
    totalActual: isNaN(totalActual) ? 0 : totalActual,
    totalRemaining: isNaN(totalEstimated - totalActual) ? 0 : totalEstimated - totalActual,
    items: budgetItems.length,
  };
}