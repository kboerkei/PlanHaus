import { memo, useState, useEffect } from "react";
import { motion, PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Menu, ChevronUp } from "lucide-react";

// Mobile-optimized card with touch interactions
interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  swipeThreshold?: number;
}

export const MobileCard = memo(({ 
  children, 
  className,
  onSwipeLeft,
  onSwipeRight,
  swipeThreshold = 100
}: MobileCardProps) => {
  const [dragX, setDragX] = useState(0);

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setDragX(info.offset.x);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    
    if (Math.abs(offset.x) > swipeThreshold || Math.abs(velocity.x) > 500) {
      if (offset.x > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (offset.x < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
    
    setDragX(0);
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -50, right: 50 }}
      dragElastic={0.2}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      animate={{ x: dragX }}
      className={cn("touch-pan-y", className)}
    >
      <Card className="relative overflow-hidden">
        {children}
        
        {/* Swipe indicators */}
        {dragX > 30 && onSwipeRight && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 bg-green-500 text-white">
            <ChevronUp className="h-5 w-5 rotate-90" />
          </div>
        )}
        {dragX < -30 && onSwipeLeft && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 bg-red-500 text-white">
            <ChevronUp className="h-5 w-5 -rotate-90" />
          </div>
        )}
      </Card>
    </motion.div>
  );
});

MobileCard.displayName = "MobileCard";

// Mobile bottom sheet for additional content
interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: number[];
  initialSnap?: number;
}

export const MobileBottomSheet = memo(({ 
  isOpen, 
  onClose, 
  title,
  children,
  snapPoints = [0.3, 0.7, 0.95],
  initialSnap = 1
}: MobileBottomSheetProps) => {
  const [currentSnap, setCurrentSnap] = useState(initialSnap);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    const windowHeight = window.innerHeight;
    const currentY = snapPoints[currentSnap] * windowHeight;
    const newY = currentY + offset.y;
    
    // Find closest snap point
    let closestSnap = 0;
    let closestDistance = Math.abs(newY - snapPoints[0] * windowHeight);
    
    snapPoints.forEach((snap, index) => {
      const distance = Math.abs(newY - snap * windowHeight);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestSnap = index;
      }
    });

    // Check for close gesture
    if (velocity.y > 500 || (offset.y > 100 && closestSnap === 0)) {
      onClose();
    } else {
      setCurrentSnap(closestSnap);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: `${(1 - snapPoints[currentSnap]) * 100}%` }}
        exit={{ y: "100%" }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-xl"
        style={{ height: "100vh" }}
      >
        {/* Handle */}
        <div className="flex justify-center p-3">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>
        
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 pb-3 border-b">
            <h2 className="text-lg font-semibold">{title}</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {children}
        </div>
      </motion.div>
    </div>
  );
});

MobileBottomSheet.displayName = "MobileBottomSheet";

// Mobile-optimized form with better touch targets
interface MobileFormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

export const MobileForm = memo(({ children, onSubmit, className }: MobileFormProps) => (
  <form 
    onSubmit={onSubmit}
    className={cn(
      "space-y-6",
      // Ensure adequate touch targets
      "[&_button]:min-h-[44px]",
      "[&_input]:min-h-[44px]",
      "[&_textarea]:min-h-[88px]",
      "[&_select]:min-h-[44px]",
      // Better spacing on mobile
      "[&_label]:text-base [&_label]:font-medium",
      "[&_.form-item]:space-y-3",
      className
    )}
  >
    {children}
  </form>
));

MobileForm.displayName = "MobileForm";

// Pull-to-refresh component
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  refreshThreshold?: number;
  className?: string;
}

export const PullToRefresh = memo(({ 
  onRefresh, 
  children, 
  refreshThreshold = 60,
  className 
}: PullToRefreshProps) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (window.scrollY === 0 && info.offset.y > 0) {
      setIsPulling(true);
      setPullDistance(Math.min(info.offset.y, refreshThreshold * 1.5));
    }
  };

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isPulling && pullDistance >= refreshThreshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setIsPulling(false);
    setPullDistance(0);
  };

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      className={cn("relative", className)}
    >
      {/* Pull indicator */}
      {(isPulling || isRefreshing) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute top-0 left-0 right-0 flex justify-center items-center h-16 bg-gray-50 z-10"
          style={{ transform: `translateY(-${64 - pullDistance}px)` }}
        >
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {isRefreshing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"
                />
                Refreshing...
              </>
            ) : (
              <>
                <ChevronUp 
                  className={cn(
                    "w-4 h-4 transition-transform",
                    pullDistance >= refreshThreshold && "rotate-180"
                  )} 
                />
                {pullDistance >= refreshThreshold ? "Release to refresh" : "Pull to refresh"}
              </>
            )}
          </div>
        </motion.div>
      )}
      
      {children}
    </motion.div>
  );
});

PullToRefresh.displayName = "PullToRefresh";

// Mobile viewport detection hook
export function useMobileViewport() {
  const [isMobile, setIsMobile] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  return { isMobile, orientation };
}

// Safe area handling for iOS devices
export const SafeAreaProvider = memo(({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background">
    <div 
      className="min-h-screen"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {children}
    </div>
  </div>
));

SafeAreaProvider.displayName = "SafeAreaProvider";