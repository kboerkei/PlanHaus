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
    mutationFn: (data: GuestFormData) => apiRequest(`/api/projects/${projectId}/guests`, {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        projectId: parseInt(projectId),
      }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'guests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/guests'] });
    },
  });
}

export function useUpdateGuest(projectId: string) {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<GuestFormData> }) =>
      apiRequest(`/api/guests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'guests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/guests'] });
    },
  });
}

export function useDeleteGuest(projectId: string) {
  return useMutation({
    mutationFn: (id: number) => apiRequest(`/api/guests/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'guests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/guests'] });
    },
  });
}

export function useBulkUpdateGuests(projectId: string) {
  return useMutation({
    mutationFn: ({ guestIds, updates }: { guestIds: number[]; updates: Partial<GuestFormData> }) =>
      apiRequest(`/api/projects/${projectId}/guests/bulk-update`, {
        method: 'PATCH',
        body: JSON.stringify({ guestIds, updates }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'guests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/guests'] });
    },
  });
}

export function useGuestStats(projectId?: string) {
  const { data: guests } = useGuests(projectId);
  
  if (!guests) return null;
  
  const stats = guests.reduce((acc: any, guest: any) => {
    acc.total += 1;
    acc.totalAttending += guest.attendingCount || 1;
    
    switch (guest.rsvpStatus) {
      case 'yes':
        acc.confirmed += 1;
        break;
      case 'no':
        acc.declined += 1;
        break;
      case 'maybe':
        acc.maybe += 1;
        break;
      default:
        acc.pending += 1;
    }
    
    if (guest.inviteSent) {
      acc.invitesSent += 1;
    }
    
    return acc;
  }, {
    total: 0,
    totalAttending: 0,
    confirmed: 0,
    declined: 0,
    maybe: 0,
    pending: 0,
    invitesSent: 0,
  });
  
  return stats;
}