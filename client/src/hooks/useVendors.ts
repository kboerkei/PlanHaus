import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { VendorFormData } from "@/schemas";
import type { Vendor, VendorInsert, VendorUpdate, VendorStats } from "@/types/vendor";

export function useVendors(projectId?: string) {
  return useQuery<Vendor[]>({
    queryKey: projectId ? ['/api/projects', projectId, 'vendors'] : ['/api/vendors'],
    queryFn: () => apiRequest<Vendor[]>(`/api/projects/${projectId}/vendors`),
    enabled: !!projectId,
  });
}

export function useCreateVendor(projectId: string) {
  return useMutation({
    mutationFn: (data: VendorFormData) => apiRequest<Vendor>(`/api/projects/${projectId}/vendors`, {
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
    mutationFn: ({ id, data }: { id: number; data: VendorUpdate }) =>
      apiRequest<Vendor>(`/api/projects/${projectId}/vendors/${id}`, {
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
    mutationFn: (id: number) => apiRequest(`/api/projects/${projectId}/vendors/${id}`, {
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
  
  const stats = vendors.reduce((acc: VendorStats, vendor: Vendor) => {
    acc.totalVendors += 1;
    
    if (vendor.status === 'booked') {
      acc.bookedVendors += 1;
    } else {
      acc.pendingVendors += 1;
    }
    
    if (vendor.cost) {
      acc.totalCost += vendor.cost;
    }
    
    // Group by category
    const category = vendor.category || 'other';
    // We'll handle category grouping at the component level
    // This hook focuses on overall stats
    
    return acc;
  }, {
    totalVendors: 0,
    bookedVendors: 0,
    pendingVendors: 0,
    totalCost: 0,
    totalPaid: 0,
    contractsSigned: 0,
  });
  
  return stats;
}