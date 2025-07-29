import { useEffect, useRef, useState } from 'react';
import * as React from 'react';

// Focus management hook
export function useFocusManagement() {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = () => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  };

  const restoreFocus = () => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  };

  const trapFocus = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  };

  return { saveFocus, restoreFocus, trapFocus };
}

// Keyboard navigation hook
export function useKeyboardNavigation(
  items: HTMLElement[],
  options: {
    loop?: boolean;
    orientation?: 'horizontal' | 'vertical';
    onSelect?: (index: number) => void;
  } = {}
) {
  const { loop = true, orientation = 'vertical', onSelect } = options;
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = (e: KeyboardEvent) => {
    const isVertical = orientation === 'vertical';
    const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
    const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';

    switch (e.key) {
      case nextKey:
        e.preventDefault();
        setActiveIndex((prev) => {
          const next = prev + 1;
          return next >= items.length ? (loop ? 0 : prev) : next;
        });
        break;
        
      case prevKey:
        e.preventDefault();
        setActiveIndex((prev) => {
          const next = prev - 1;
          return next < 0 ? (loop ? items.length - 1 : prev) : next;
        });
        break;
        
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
        
      case 'End':
        e.preventDefault();
        setActiveIndex(items.length - 1);
        break;
        
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (onSelect) {
          onSelect(activeIndex);
        }
        break;
    }
  };

  useEffect(() => {
    if (items[activeIndex]) {
      items[activeIndex].focus();
    }
  }, [activeIndex, items]);

  return { activeIndex, handleKeyDown };
}

// Screen reader announcement hook
export function useScreenReader() {
  const [announcements, setAnnouncements] = useState<string[]>([]);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncements((prev) => [...prev, message]);
    
    // Clear announcement after it's been read
    setTimeout(() => {
      setAnnouncements((prev) => prev.filter((msg) => msg !== message));
    }, 1000);
  };

  const AnnouncementRegion = () => {
    return React.createElement('div', {
      'aria-live': 'polite',
      'aria-atomic': 'true', 
      className: 'sr-only'
    }, announcements.map((message, index) => 
      React.createElement('div', { key: index }, message)
    ));
  };

  return { announce, AnnouncementRegion };
}

// ARIA attributes helper
export function useAriaAttributes() {
  const generateId = (prefix: string = 'aria') => {
    return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
  };

  const getExpandedProps = (isExpanded: boolean) => ({
    'aria-expanded': isExpanded,
  });

  const getSelectedProps = (isSelected: boolean) => ({
    'aria-selected': isSelected,
  });

  const getCheckedProps = (isChecked: boolean) => ({
    'aria-checked': isChecked,
  });

  const getDescribedByProps = (ids: (string | undefined)[]) => {
    const validIds = ids.filter(Boolean);
    return validIds.length > 0 ? { 'aria-describedby': validIds.join(' ') } : {};
  };

  const getLabelledByProps = (ids: (string | undefined)[]) => {
    const validIds = ids.filter(Boolean);
    return validIds.length > 0 ? { 'aria-labelledby': validIds.join(' ') } : {};
  };

  return {
    generateId,
    getExpandedProps,
    getSelectedProps,
    getCheckedProps,
    getDescribedByProps,
    getLabelledByProps,
  };
}

// Color contrast helper
export function useColorContrast() {
  const checkContrast = (foreground: string, background: string): 'AAA' | 'AA' | 'fail' => {
    // This would integrate with a color contrast checking library
    // For now, returning a placeholder
    return 'AA';
  };

  const getAccessibleColor = (baseColor: string, backgroundColor: string): string => {
    // This would automatically adjust colors for better contrast
    return baseColor;
  };

  return { checkContrast, getAccessibleColor };
}

// Mobile touch accessibility
export function useTouchAccessibility() {
  const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStartTime(Date.now());
    const touch = e.touches[0];
    setTouchPosition({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: TouchEvent, onLongPress?: () => void, onTap?: () => void) => {
    const touchDuration = Date.now() - touchStartTime;
    const touch = e.changedTouches[0];
    const deltaX = Math.abs(touch.clientX - touchPosition.x);
    const deltaY = Math.abs(touch.clientY - touchPosition.y);
    
    // Check if it's a tap (not a drag)
    if (deltaX < 10 && deltaY < 10) {
      if (touchDuration > 500 && onLongPress) {
        onLongPress();
      } else if (touchDuration < 500 && onTap) {
        onTap();
      }
    }
  };

  const getTouchProps = (handlers: { onTap?: () => void; onLongPress?: () => void }) => ({
    onTouchStart: handleTouchStart,
    onTouchEnd: (e: TouchEvent) => handleTouchEnd(e, handlers.onLongPress, handlers.onTap),
    style: { touchAction: 'manipulation' }, // Prevents double-tap zoom
  });

  return { getTouchProps };
}