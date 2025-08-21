import React, { useState, useRef, useEffect } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { ChevronUp, ChevronDown, X, Menu, Search, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

// Enhanced mobile bottom sheet
interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  snapPoints?: number[];
  defaultSnap?: number;
}

export const MobileBottomSheet = ({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [25, 50, 90],
  defaultSnap = 25
}: MobileBottomSheetProps) => {
  const [currentSnap, setCurrentSnap] = useState(defaultSnap);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 300], [1, 0]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    
    if (offset.y > 100 || velocity.y > 500) {
      onClose();
    } else {
      // Snap to nearest point
      const nearestSnap = snapPoints.reduce((prev, curr) => 
        Math.abs(curr - (offset.y / window.innerHeight * 100)) < Math.abs(prev - (offset.y / window.innerHeight * 100)) ? curr : prev
      );
      setCurrentSnap(nearestSnap);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50"
      style={{ opacity }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
      />

      {/* Sheet */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl"
        style={{
          height: `${currentSnap}vh`,
          y
        }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        initial={{ y: '100%' }}
        animate={{ y: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Enhanced mobile navigation with gestures
interface MobileNavProps {
  items: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    href: string;
    badge?: number;
  }>;
  activeItem?: string;
  onItemClick?: (id: string) => void;
}

export const MobileNav = ({ items, activeItem, onItemClick }: MobileNavProps) => {
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const handleSwipe = (direction: 'left' | 'right') => {
    setSwipeDirection(direction);
    setTimeout(() => setSwipeDirection(null), 300);
  };

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      <div className="flex items-center justify-around px-4 py-2">
        {items.map((item, index) => (
          <motion.button
            key={item.id}
            onClick={() => onItemClick?.(item.id)}
            className={cn(
              'flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200',
              'min-h-[44px] min-w-[44px] touch-manipulation',
              activeItem === item.id
                ? 'text-pink-500 bg-pink-50'
                : 'text-gray-600 hover:text-pink-500 hover:bg-pink-50'
            )}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="relative">
              {item.icon}
              {item.badge && (
                <motion.div
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                >
                  {item.badge}
                </motion.div>
              )}
            </div>
            <span className="text-xs mt-1 font-medium">{item.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.nav>
  );
};

// Enhanced mobile search with voice input
interface MobileSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onVoiceInput?: () => void;
  className?: string;
}

export const MobileSearch = ({
  placeholder = 'Search...',
  onSearch,
  onVoiceInput,
  className
}: MobileSearchProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={cn(
        'relative bg-gray-100 rounded-2xl p-3 transition-all duration-200',
        isFocused && 'bg-white shadow-lg ring-2 ring-pink-500/20',
        className
      )}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <div className="flex items-center space-x-3">
        <Search className="h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none text-base"
          style={{ fontSize: '16px' }} // Prevents zoom on iOS
        />
        {onVoiceInput && (
          <motion.button
            type="button"
            onClick={onVoiceInput}
            className="p-2 rounded-full bg-pink-500 text-white"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </motion.button>
        )}
      </div>
    </motion.form>
  );
};

// Enhanced mobile floating action button
interface MobileFABProps {
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success';
  size?: 'sm' | 'md' | 'lg';
  position?: 'bottom-right' | 'bottom-left' | 'center';
}

export const MobileFAB = ({
  icon = <Plus className="h-6 w-6" />,
  onClick,
  variant = 'primary',
  size = 'md',
  position = 'bottom-right'
}: MobileFABProps) => {
  const positions = {
    'bottom-right': 'bottom-20 right-4',
    'bottom-left': 'bottom-20 left-4',
    'center': 'bottom-20 left-1/2 transform -translate-x-1/2'
  };

  const variants = {
    primary: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white',
    secondary: 'bg-gray-800 text-white',
    success: 'bg-green-500 text-white'
  };

  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  };

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'fixed z-40 rounded-full shadow-lg',
        'flex items-center justify-center',
        'touch-manipulation min-h-[44px] min-w-[44px]',
        variants[variant],
        sizes[size],
        positions[position]
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 15, stiffness: 300 }}
    >
      {icon}
    </motion.button>
  );
};

// Enhanced mobile card with swipe actions
interface MobileSwipeCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    icon: React.ReactNode;
    label: string;
    color: string;
  };
  rightAction?: {
    icon: React.ReactNode;
    label: string;
    color: string;
  };
  className?: string;
}

export const MobileSwipeCard = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  className
}: MobileSwipeCardProps) => {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = (event: any, info: PanInfo) => {
    setDragX(info.offset.x);
    setIsDragging(true);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    
    if (Math.abs(offset.x) > 100 || Math.abs(velocity.x) > 500) {
      if (offset.x > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (offset.x < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
    
    setDragX(0);
    setIsDragging(false);
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Background actions */}
      <div className="absolute inset-0 flex">
        {rightAction && (
          <div className="flex-1 bg-green-500 flex items-center justify-center">
            <div className="text-white text-center">
              {rightAction.icon}
              <span className="text-sm font-medium">{rightAction.label}</span>
            </div>
          </div>
        )}
        {leftAction && (
          <div className="flex-1 bg-red-500 flex items-center justify-center">
            <div className="text-white text-center">
              {leftAction.icon}
              <span className="text-sm font-medium">{leftAction.label}</span>
            </div>
          </div>
        )}
      </div>

      {/* Card content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
        dragElastic={0.2}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ x: dragX }}
        className="relative bg-white"
      >
        {children}
      </motion.div>
    </div>
  );
}; 