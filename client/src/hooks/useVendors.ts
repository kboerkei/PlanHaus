import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { VendorFormData } from "@/schemas";

export function useVendors(projectId?: string) {
  return useQuery({
    queryKey: projectId ? ['/api/projects', projectId, 'vendors'] : ['/api/vendors'],
    enabled: !!projectId,
  });
}

export function useCreateVendor(projectId: string) {
  return useMutation({
    mutationFn: (data: VendorFormData) => 
      apiRequest(`/api/projects/${projectId}/vendors`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'vendors'] });
    }
  });
}

export function useUpdateVendor(projectId: string) {
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<VendorFormData> }) => 
      apiRequest(`/api/vendors/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'vendors'] });
    }
  });
}

export function useDeleteVendor(projectId: string) {
  return useMutation({
    mutationFn: (id: string) => 
      apiRequest(`/api/vendors/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'vendors'] });
    }
  });
}