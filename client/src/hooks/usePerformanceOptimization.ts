import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

// Enhanced debounce hook with cancel function
export function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return { debouncedValue, cancel };
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const mountTime = useRef(Date.now());
  
  useEffect(() => {
    renderCount.current += 1;
  });

  const getMetrics = useCallback(() => {
    const timeSinceMount = Date.now() - mountTime.current;
    return {
      renderCount: renderCount.current,
      timeSinceMount: `${timeSinceMount.toFixed(2)}ms`,
      component: componentName
    };
  }, [componentName]);

  // Log performance in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName}:`, getMetrics());
    }
  }, [componentName, getMetrics]);

  return getMetrics;
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  {
    threshold = 0.1,
    root = null,
    rootMargin = '0%',
    freezeOnceVisible = true
  }: {
    threshold?: number;
    root?: Element | null;
    rootMargin?: string;
    freezeOnceVisible?: boolean;
  } = {}
) {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();

  const frozen = entry?.isIntersecting && freezeOnceVisible;

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry);
  };

  useEffect(() => {
    const node = elementRef?.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen || !node) return;

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(updateEntry, observerParams);

    observer.observe(node);

    return () => observer.disconnect();
  }, [elementRef, threshold, root, rootMargin, frozen]);

  return entry;
}

// Optimized query hook with request cancellation
export function useOptimizedQuery<T>(
  queryKey: (string | number)[],
  queryFn: ({ signal }: { signal: AbortSignal }) => Promise<T>,
  options: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    refetchOnWindowFocus?: boolean;
  } = {}
) {
  const abortController = useRef<AbortController>();

  const query = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      // Cancel previous request if still pending
      if (abortController.current) {
        abortController.current.abort();
      }
      
      // Create new abort controller
      abortController.current = new AbortController();
      
      return queryFn({ signal: abortController.current.signal });
    },
    staleTime: options.staleTime ?? 5 * 60 * 1000, // 5 minutes default
    gcTime: options.gcTime ?? 10 * 60 * 1000, // 10 minutes default
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? false,
    enabled: options.enabled,
  });

  // Cancel request on unmount
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  return query;
}

// Memory usage monitoring
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize?: number;
    totalJSHeapSize?: number;
    jsHeapSizeLimit?: number;
  }>({});

  useEffect(() => {
    if (!('memory' in performance)) return;

    const updateMemoryInfo = () => {
      const memory = (performance as any).memory;
      setMemoryInfo({
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      });
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
}

// Throttle hook for performance-sensitive operations
export function useThrottle<T>(value: T, limit: number) {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

// Image lazy loading hook
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!imageRef || !src) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = new Image();
            
            img.onload = () => {
              setImageSrc(src);
              setIsLoaded(true);
              observer.disconnect();
            };
            
            img.onerror = () => {
              setIsError(true);
              observer.disconnect();
            };
            
            img.src = src;
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(imageRef);

    return () => observer.disconnect();
  }, [src, imageRef]);

  return {
    src: imageSrc,
    setRef: setImageRef,
    isLoaded,
    isError
  };
}

// Batch state updates for better performance
export function useBatchedState<T extends object>(initialState: T) {
  const [state, setState] = useState<T>(initialState);
  const pendingUpdates = useRef<Partial<T>[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const batchUpdate = useCallback((update: Partial<T>) => {
    pendingUpdates.current.push(update);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setState(prevState => {
        const newState = { ...prevState };
        pendingUpdates.current.forEach(update => {
          Object.assign(newState, update);
        });
        pendingUpdates.current = [];
        return newState;
      });
    }, 16); // Batch updates within a frame (16ms)
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, batchUpdate] as const;
}

// Virtual scrolling hook for large lists
export function useVirtualScroll<T>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length, startIndex + visibleCount + overscan * 2);

  const visibleItems = useMemo(() => {
    const visible = [];
    for (let i = startIndex; i < endIndex; i++) {
      visible.push({
        index: i,
        item: items[i],
        top: i * itemHeight,
      });
    }
    return visible;
  }, [items, startIndex, endIndex, itemHeight]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    containerProps: {
      style: {
        height: containerHeight,
        overflow: 'auto',
      },
      onScroll: handleScroll,
    },
  };
}