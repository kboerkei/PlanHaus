import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  renderCount: number;
  timeSinceMount: string;
  lastRenderTime?: number;
}

export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const mountTime = useRef(Date.now());
  const lastRenderTime = useRef<number>();

  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceMount = `${(now - mountTime.current).toFixed(2)}ms`;
    
    const metrics: PerformanceMetrics = {
      renderCount: renderCount.current,
      timeSinceMount,
      lastRenderTime: lastRenderTime.current ? now - lastRenderTime.current : undefined,
    };

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName}:`, metrics);
    }

    lastRenderTime.current = now;
  });

  return {
    renderCount: renderCount.current,
    timeSinceMount: Date.now() - mountTime.current,
  };
}

export function useDebounce<T>(value: T, delay: number): T {
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

