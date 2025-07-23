import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useProjects() {
  return useQuery({
    queryKey: ['/api/projects'],
    queryFn: () => apiRequest('/api/projects'),
  });
}

export function useCurrentProject() {
  const { data: projects, ...rest } = useProjects();
  const currentProject = projects?.find(p => p.name === "Emma & Jake's Wedding") || projects?.[0];
  
  return {
    data: currentProject,
    ...rest
  };
}