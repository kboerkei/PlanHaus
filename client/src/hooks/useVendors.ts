import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { VendorFormData } from "@/schemas";

export function useVendors(projectId?: string) {
  return useQuery({
    queryKey: projectId ? ['/api/projects', projectId, 'vendors'] : ['/api/vendors'],
    queryFn: () => apiRequest(`/api/projects/${projectId}/vendors`),
    enabled: !!projectId,
  });
}

export function useCreateVendor(projectId: string) {
  return useMutation({
    mutationFn: (data: VendorFormData) => apiRequest('/api/vendors', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        projectId: parseInt(projectId),
      }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'vendors'] });
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
    },
  });
}

export function useUpdateVendor(projectId: string) {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<VendorFormData> }) =>
      apiRequest(`/api/vendors/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'vendors'] });
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
    },
  });
}

export function useDeleteVendor(projectId: string) {
  return useMutation({
    mutationFn: (id: number) => apiRequest(`/api/vendors/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'vendors'] });
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
    },
  });
}

export function useVendorStats(projectId?: string) {
  const { data: vendors } = useVendors(projectId);
  
  if (!vendors) return null;
  
  const stats = vendors.reduce((acc: any, vendor: any) => {
    acc.total += 1;
    
    if (vendor.isBooked) {
      acc.booked += 1;
    } else {
      acc.pending += 1;
    }
    
    if (vendor.estimatedCost) {
      acc.totalEstimatedCost += vendor.estimatedCost;
    }
    
    // Group by type
    const type = vendor.type || 'other';
    if (!acc.byType[type]) {
      acc.byType[type] = 0;
    }
    acc.byType[type] += 1;
    
    return acc;
  }, {
    total: 0,
    booked: 0,
    pending: 0,
    totalEstimatedCost: 0,
    byType: {},
  });
  
  return stats;
}