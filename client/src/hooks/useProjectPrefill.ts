import { useState, useEffect, useCallback } from 'react';
import { IntakeData } from '../schemas/intake';
import { 
  toProjectMeta, 
  toBudgetPlan, 
  toTimelineSeed, 
  toVendorFilters,
  toSiteContentPrefs,
  toGuestPrefs,
  toEventDetails,
  isIntakeComplete,
  getIntakeCompletion
} from '../lib/mapping/prefillMappings';

interface PrefillData {
  projectMeta: ReturnType<typeof toProjectMeta>;
  budgetPlan: ReturnType<typeof toBudgetPlan>;
  timelineTasks: ReturnType<typeof toTimelineSeed>;
  vendorFilters: ReturnType<typeof toVendorFilters>;
  sitePrefs: ReturnType<typeof toSiteContentPrefs>;
  guestPrefs: ReturnType<typeof toGuestPrefs>;
  eventDetails: ReturnType<typeof toEventDetails>;
}

interface UseProjectPrefillReturn {
  prefillData: PrefillData | null;
  isLoading: boolean;
  error: string | null;
  isIntakeComplete: boolean;
  completionPercentage: number;
  loadIntakeData: () => Promise<void>;
  applyPrefill: () => Promise<boolean>;
}

export const useProjectPrefill = (): UseProjectPrefillReturn => {
  const [prefillData, setPrefillData] = useState<PrefillData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intakeData, setIntakeData] = useState<IntakeData | null>(null);

  const projectId = new URLSearchParams(window.location.search).get('projectId');

  // Load intake data for the current project
  const loadIntakeData = useCallback(async () => {
    if (!projectId) {
      setError('No project ID provided');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/intake?projectId=${projectId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('No intake data found for this project');
          return;
        }
        throw new Error('Failed to load intake data');
      }

      const data = await response.json();
      setIntakeData(data);

      // Generate prefill data
      const projectMeta = toProjectMeta(data);
      const budgetPlan = toBudgetPlan(data);
      const timelineTasks = toTimelineSeed(data);
      const vendorFilters = toVendorFilters(data);
      const sitePrefs = toSiteContentPrefs(data);
      const guestPrefs = toGuestPrefs(data);
      const eventDetails = toEventDetails(data);

      setPrefillData({
        projectMeta,
        budgetPlan,
        timelineTasks,
        vendorFilters,
        sitePrefs,
        guestPrefs,
        eventDetails,
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load intake data');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Apply prefill data to the current project
  const applyPrefill = useCallback(async (): Promise<boolean> => {
    if (!prefillData || !projectId) {
      setError('No prefill data or project ID available');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Apply project metadata
      if (prefillData.projectMeta) {
        await fetch(`/api/projects/${projectId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prefillData.projectMeta),
        });
      }

      // Apply budget plan
      if (prefillData.budgetPlan) {
        await fetch(`/api/projects/${projectId}/budget`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prefillData.budgetPlan),
        });
      }

      // Apply timeline tasks
      if (prefillData.timelineTasks.length > 0) {
        await fetch(`/api/projects/${projectId}/tasks/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tasks: prefillData.timelineTasks }),
        });
      }

      // Apply vendor preferences
      if (prefillData.vendorFilters) {
        await fetch(`/api/projects/${projectId}/vendor-preferences`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prefillData.vendorFilters),
        });
      }

      // Apply site preferences
      if (prefillData.sitePrefs) {
        await fetch(`/api/projects/${projectId}/site-preferences`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prefillData.sitePrefs),
        });
      }

      // Apply guest preferences
      if (prefillData.guestPrefs) {
        await fetch(`/api/projects/${projectId}/guest-preferences`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prefillData.guestPrefs),
        });
      }

      // Apply event details
      if (prefillData.eventDetails) {
        await fetch(`/api/projects/${projectId}/event-details`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prefillData.eventDetails),
        });
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply prefill data');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [prefillData, projectId]);

  // Load intake data on mount if projectId is available
  useEffect(() => {
    if (projectId) {
      loadIntakeData();
    }
  }, [projectId, loadIntakeData]);

  return {
    prefillData,
    isLoading,
    error,
    isIntakeComplete: intakeData ? isIntakeComplete(intakeData) : false,
    completionPercentage: intakeData ? getIntakeCompletion(intakeData) : 0,
    loadIntakeData,
    applyPrefill,
  };
};

// Hook for dashboard prefill
export const useDashboardPrefill = () => {
  const { prefillData, isLoading, error, isIntakeComplete, completionPercentage } = useProjectPrefill();
  
  return {
    projectMeta: prefillData?.projectMeta,
    isLoading,
    error,
    isIntakeComplete,
    completionPercentage,
  };
};

// Hook for budget prefill
export const useBudgetPrefill = () => {
  const { prefillData, isLoading, error, applyPrefill } = useProjectPrefill();
  
  return {
    budgetPlan: prefillData?.budgetPlan,
    isLoading,
    error,
    applyPrefill,
  };
};

// Hook for timeline prefill
export const useTimelinePrefill = () => {
  const { prefillData, isLoading, error, applyPrefill } = useProjectPrefill();
  
  return {
    timelineTasks: prefillData?.timelineTasks,
    isLoading,
    error,
    applyPrefill,
  };
};

// Hook for vendor prefill
export const useVendorPrefill = () => {
  const { prefillData, isLoading, error, applyPrefill } = useProjectPrefill();
  
  return {
    vendorFilters: prefillData?.vendorFilters,
    isLoading,
    error,
    applyPrefill,
  };
};

// Hook for guest management prefill
export const useGuestPrefill = () => {
  const { prefillData, isLoading, error, applyPrefill } = useProjectPrefill();
  
  return {
    guestPrefs: prefillData?.guestPrefs,
    isLoading,
    error,
    applyPrefill,
  };
}; 