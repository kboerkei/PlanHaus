import { useCallback, useMemo, useRef } from 'react';
import { debounce } from 'use-debounce';

/**
 * Performance optimization hooks for the wedding planning app
 */

// Debounce search inputs to reduce API calls
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue] = debounce(value, delay);
  return debouncedValue;
}

// Memoize expensive filtering operations
export function useMemoizedFilter<T>(
  items: T[],
  filterFn: (item: T) => boolean,
  dependencies: any[]
) {
  return useMemo(() => {
    if (!Array.isArray(items)) return [];
    return items.filter(filterFn);
  }, [items, ...dependencies]);
}

// Optimize re-renders for form inputs
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  
  return useCallback((...args: any[]) => {
    return callbackRef.current(...args);
  }, []) as T;
}

// Virtual scrolling for large lists (guests, tasks, etc.)
export function useVirtualization(itemCount: number, itemHeight: number, containerHeight: number) {
  return useMemo(() => {
    const visibleItemCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = 0; // This would be calculated based on scroll position
    const endIndex = Math.min(startIndex + visibleItemCount + 2, itemCount); // +2 for buffer
    
    return {
      visibleItemCount,
      startIndex,
      endIndex,
      totalHeight: itemCount * itemHeight
    };
  }, [itemCount, itemHeight, containerHeight]);
}

// Memory-efficient image loading
export function useImagePreloader(urls: string[]) {
  const preloadedImages = useRef(new Set<string>());
  
  const preloadImage = useCallback((url: string) => {
    if (preloadedImages.current.has(url)) return;
    
    const img = new Image();
    img.onload = () => preloadedImages.current.add(url);
    img.src = url;
  }, []);
  
  return { preloadImage, isPreloaded: (url: string) => preloadedImages.current.has(url) };
}