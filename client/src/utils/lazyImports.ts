import { lazy } from 'react';

// Lazy load heavy components to reduce initial bundle size
export const LazyDropzone = lazy(() => import('react-dropzone'));

// Code splitting for AI components
export const LazyAIAssistant = lazy(() => import('@/pages/ai-assistant'));
export const LazyChat = lazy(() => import('@/pages/Chat'));

// Lazy load export functionality
export const LazyExportDialog = lazy(() => import('@/components/export/ExportDialog'));

// Lazy load heavy pages
export const LazyBudget = lazy(() => import('@/pages/budget'));
export const LazyGuests = lazy(() => import('@/pages/guests'));
export const LazyVendors = lazy(() => import('@/pages/vendors'));
export const LazyTimeline = lazy(() => import('@/pages/timeline'));
export const LazySeatingChart = lazy(() => import('@/pages/seating-chart'));

// Lazy load chart components
export const LazyBudgetCharts = lazy(() => import('@/components/BudgetCharts'));
export const LazyDashboardCharts = lazy(() => import('@/components/dashboard/dashboard-charts'));

// Lazy load form components
export const LazyGuestForm = lazy(() => import('@/components/guests/GuestFormDialog'));
export const LazyVendorForm = lazy(() => import('@/components/vendors/VendorFormDialog'));
export const LazyBudgetForm = lazy(() => import('@/components/budget/BudgetEntryDialog'));

// Lazy load utility components
export const LazyFileDropzone = lazy(() => import('@/components/optimized/OptimizedFileDropzone'));
export const LazyErrorBoundary = lazy(() => import('@/components/layout/EnhancedErrorBoundary'));

// Preload critical components
export const preloadCriticalComponents = () => {
  // Preload components likely to be used soon
  import('@/components/export/ExportDialog');
  import('@/pages/budget');
  import('@/pages/guests');
};

// Preload based on user behavior
export const preloadUserComponents = (userType: 'planner' | 'couple') => {
  if (userType === 'planner') {
    // Preload planner-specific components
    import('@/components/vendors/VendorFormDialog');
    import('@/components/budget/BudgetEntryDialog');
  } else {
    // Preload couple-specific components
    import('@/components/guests/GuestFormDialog');
    import('@/pages/seating-chart');
  }
};