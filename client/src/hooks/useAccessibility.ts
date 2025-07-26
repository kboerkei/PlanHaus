import { useEffect, useRef, useState, useCallback } from 'react';

// Focus management hook
export function useFocusManagement() {
  const focusRef = useRef<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const setFocus = useCallback((element: HTMLElement | null) => {
    if (element) {
      // Store previous focus for restoration
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Set new focus with slight delay for screen readers
      setTimeout(() => {
        element.focus();
        focusRef.current = element;
      }, 100);
    }
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, []);

  return { setFocus, restoreFocus, currentFocus: focusRef.current };
}

// Keyboard navigation hook
export function useKeyboardNavigation(
  items: HTMLElement[],
  onSelect?: (index: number) => void
) {
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!items.length) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex(prev => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex(prev => (prev - 1 + items.length) % items.length);
        break;
      case 'Enter':
      case ' ':
        if (activeIndex >= 0 && onSelect) {
          event.preventDefault();
          onSelect(activeIndex);
        }
        break;
      case 'Escape':
        setActiveIndex(-1);
        break;
    }
  }, [items, activeIndex, onSelect]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (activeIndex >= 0 && items[activeIndex]) {
      items[activeIndex].focus();
    }
  }, [activeIndex, items]);

  return { activeIndex, setActiveIndex };
}

// Reduced motion preference hook
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// Screen reader announcements
export function useScreenReader() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    
    document.body.appendChild(announcement);
    announcement.textContent = message;
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  return { announce };
}

// High contrast detection
export function useHighContrast() {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const checkHighContrast = () => {
      // Detection method for Windows high contrast mode
      const testDiv = document.createElement('div');
      testDiv.style.position = 'absolute';
      testDiv.style.left = '-999px';
      testDiv.style.backgroundColor = 'rgb(255, 255, 255)';
      testDiv.style.color = 'rgb(0, 0, 0)';
      
      document.body.appendChild(testDiv);
      
      const computedStyle = window.getComputedStyle(testDiv);
      const isHighContrastMode = computedStyle.backgroundColor === computedStyle.color;
      
      document.body.removeChild(testDiv);
      setIsHighContrast(isHighContrastMode);
    };

    checkHighContrast();
    
    // Listen for system changes
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    const handleChange = () => checkHighContrast();
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isHighContrast;
}

// Accessible form validation
export function useAccessibleValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { announce } = useScreenReader();

  const validateField = useCallback((name: string, value: string, rules: any) => {
    // Implementation would depend on validation rules
    const fieldErrors: string[] = [];
    
    if (rules.required && !value.trim()) {
      fieldErrors.push(`${name} is required`);
    }
    
    if (rules.minLength && value.length < rules.minLength) {
      fieldErrors.push(`${name} must be at least ${rules.minLength} characters`);
    }
    
    const errorMessage = fieldErrors[0] || '';
    
    setErrors(prev => ({
      ...prev,
      [name]: errorMessage
    }));
    
    // Announce errors to screen readers
    if (errorMessage) {
      announce(`Error: ${errorMessage}`, 'assertive');
    }
    
    return !errorMessage;
  }, [announce]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return { errors, validateField, clearErrors };
}