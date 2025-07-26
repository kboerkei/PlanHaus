import { lazy } from 'react';

// Lazy load heavy components to reduce initial bundle size
export const LazyDropzone = lazy(() => import('react-dropzone'));

// Code splitting for AI components
export const LazyAIAssistant = lazy(() => import('@/pages/ai-assistant'));

// Lazy load export functionality
export const LazyExportDialog = lazy(() => import('@/components/export/ExportDialog'));

// Preload critical components
export const preloadCriticalComponents = () => {
  // Preload components likely to be used soon
  import('@/components/export/ExportDialog');
};