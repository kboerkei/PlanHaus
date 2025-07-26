import { lazy } from 'react';

// Lazy load heavy components to reduce initial bundle size
export const LazyCharts = lazy(() => import('@/components/charts/ChartComponents'));
export const LazyCalendar = lazy(() => import('react-big-calendar'));
export const LazyDropzone = lazy(() => import('react-dropzone'));
export const LazyMoodBoard = lazy(() => import('@/components/inspiration/MoodBoard'));

// Code splitting for AI components
export const LazyAIAssistant = lazy(() => import('@/pages/ai-assistant'));
export const LazyAIRecommendations = lazy(() => import('@/components/ai/AIRecommendations'));

// Lazy load export functionality
export const LazyExportDialog = lazy(() => import('@/components/export/ExportDialog'));

// Preload critical components
export const preloadCriticalComponents = () => {
  // Preload components likely to be used soon
  import('@/components/charts/ChartComponents');
  import('@/components/export/ExportDialog');
};