import { useCallback, useEffect, useRef, useState } from 'react';
// Simple debounce implementation to avoid lodash dependency
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): T & { cancel: () => void } {
  const { leading = false, trailing = true } = options;
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastCallTime = 0;

  const debounced = (...args: Parameters<T>) => {
    lastArgs = args;
    const now = Date.now();

    if (leading && now - lastCallTime > delay) {
      lastCallTime = now;
      return func(...args);
    }

    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      if (trailing && lastArgs) {
        func(...lastArgs);
      }
      timeoutId = null;
      lastCallTime = Date.now();
    }, delay);
  };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced as T & { cancel: () => void };
}

// AbortController hook for request cancellation
export function useAbortController() {
  const abortControllerRef = useRef<AbortController>();

  const getAbortSignal = useCallback(() => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new controller
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current.signal;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { getAbortSignal };
}

// Debounced search hook
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Debounced callback hook
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const debouncedCallback = useRef(
    debounce(callback, delay, { leading: false, trailing: true })
  ).current;

  useEffect(() => {
    return () => {
      debouncedCallback.cancel();
    };
  }, [debouncedCallback]);

  return debouncedCallback as T;
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options]);

  return isIntersecting;
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const mountTime = useRef(performance.now());
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    
    if (import.meta.env.DEV) {
      const currentTime = performance.now();
      const timeSinceMount = currentTime - mountTime.current;
      
      console.debug(`[Performance] ${componentName}:`, {
        renderCount: renderCount.current,
        timeSinceMount: `${timeSinceMount.toFixed(2)}ms`
      });
    }
  });

  return {
    renderCount: renderCount.current,
    timeSinceMount: performance.now() - mountTime.current
  };
}

// Memory usage monitoring (development only)
export function useMemoryMonitor() {
  const [memoryUsage, setMemoryUsage] = useState<any>(null);

  useEffect(() => {
    if (import.meta.env.DEV !== true) return;
    
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        setMemoryUsage((performance as any).memory);
      }
    };

    updateMemoryUsage();
    const interval = setInterval(updateMemoryUsage, 5000);

    return () => clearInterval(interval);
  }, []);

  return memoryUsage;
}

// Bundle size analyzer (development helper)
export function logBundleSize() {
  if (import.meta.env.DEV) {
    console.debug('[Bundle] Performance hooks loaded');
  }
}