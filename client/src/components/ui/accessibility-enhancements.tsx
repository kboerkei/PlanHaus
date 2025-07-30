import { memo, useEffect, useRef, useState, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Input } from "./input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";

// Skip to main content link for screen readers
export const SkipToMain = memo(() => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50 transition-all"
  >
    Skip to main content
  </a>
));

SkipToMain.displayName = "SkipToMain";

// Enhanced focus management
export function useFocusManagement() {
  const focusRef = useRef<HTMLElement | null>(null);

  const setFocus = (element: HTMLElement | null) => {
    if (element) {
      element.focus();
      focusRef.current = element;
    }
  };

  const restoreFocus = () => {
    if (focusRef.current) {
      focusRef.current.focus();
    }
  };

  return { setFocus, restoreFocus };
}

// Accessible button with enhanced keyboard support
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  loading?: boolean;
  loadingText?: string;
}

export const AccessibleButton = memo(forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ className, variant, size, loading, loadingText, children, disabled, ...props }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "focus:ring-2 focus:ring-offset-2 focus:ring-blush",
          "transition-all duration-200",
          className
        )}
        disabled={isDisabled}
        aria-busy={loading}
        aria-describedby={loading ? `${props.id}-loading` : undefined}
        {...props}
      >
        {loading ? (
          <>
            <span className="animate-spin mr-2">⟳</span>
            {loadingText || "Loading..."}
            <span id={`${props.id}-loading`} className="sr-only">
              {loadingText || "Loading, please wait"}
            </span>
          </>
        ) : (
          children
        )}
      </Button>
    );
  }
));

AccessibleButton.displayName = "AccessibleButton";

// Accessible input with proper labeling
interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  description?: string;
  required?: boolean;
}

export const AccessibleInput = memo(forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({ label, error, description, required, className, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const descriptionId = description ? `${inputId}-description` : undefined;

    const ariaDescribedBy = [errorId, descriptionId].filter(Boolean).join(' ') || undefined;

    return (
      <div className="space-y-2">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
        
        <Input
          ref={ref}
          id={inputId}
          className={cn(
            "focus:ring-2 focus:ring-blush focus:border-blush",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={ariaDescribedBy}
          aria-required={required}
          {...props}
        />
        
        {description && (
          <p id={descriptionId} className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
        
        {error && (
          <p id={errorId} className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
));

AccessibleInput.displayName = "AccessibleInput";

// Accessible modal with focus trap
interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const AccessibleModal = memo(({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children 
}: AccessibleModalProps) => {
  const { setFocus, restoreFocus } = useFocusManagement();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus the modal when it opens
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 100);
    } else {
      // Restore focus when modal closes
      restoreFocus();
    }
  }, [isOpen, restoreFocus]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        ref={modalRef}
        className="focus:outline-none"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? "modal-description" : undefined}
      >
        <DialogHeader>
          <DialogTitle id="modal-title">{title}</DialogTitle>
          {description && (
            <p id="modal-description" className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
});

AccessibleModal.displayName = "AccessibleModal";

// High contrast mode detection
export function useHighContrast() {
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setHighContrast(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setHighContrast(e.matches);
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return highContrast;
}

// Reduced motion detection
export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
}

// Screen reader announcements
export function useScreenReaderAnnouncement() {
  const [announcement, setAnnouncement] = useState('');

  const announce = (message: string) => {
    setAnnouncement(message);
    // Clear after announcement
    setTimeout(() => setAnnouncement(''), 1000);
  };

  return { announce, ScreenReaderAnnouncement: () => (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  )};
}

// Keyboard navigation helper
export function useKeyboardNavigation(refs: React.RefObject<HTMLElement>[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const currentIndex = refs.findIndex(ref => 
        ref.current === document.activeElement
      );

      if (currentIndex === -1) return;

      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          const nextIndex = (currentIndex + 1) % refs.length;
          refs[nextIndex].current?.focus();
          break;
        
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          const prevIndex = currentIndex === 0 ? refs.length - 1 : currentIndex - 1;
          refs[prevIndex].current?.focus();
          break;
        
        case 'Home':
          event.preventDefault();
          refs[0].current?.focus();
          break;
        
        case 'End':
          event.preventDefault();
          refs[refs.length - 1].current?.focus();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [refs]);
}