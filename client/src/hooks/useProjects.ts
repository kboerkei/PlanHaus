import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Project {
  id: number;
  name: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  // Add other project properties as needed
}

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ['/api/projects'],
    queryFn: () => apiRequest('/api/projects'),
    enabled: !!localStorage.getItem('sessionId'),
    staleTime: 15 * 60 * 1000, // 15 minutes - projects change infrequently
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });
}

export function useCurrentProject() {
  const { data: projects, ...rest } = useProjects();
  const currentProject = projects?.find((p: Project) => p.name === "Emma & Jake's Wedding") || projects?.[0];
  
  return {
    data: currentProject,
    ...rest
  };
}