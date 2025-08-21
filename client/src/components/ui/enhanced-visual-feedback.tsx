import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, Star, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

// Enhanced toast notification
interface EnhancedToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EnhancedToast = ({
  type,
  title,
  message,
  duration = 5000,
  onClose,
  action
}: EnhancedToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />
  };

  const colors = {
    success: 'border-green-200 bg-green-50',
    error: 'border-red-200 bg-red-50',
    warning: 'border-yellow-200 bg-yellow-50',
    info: 'border-blue-200 bg-blue-50'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className={cn(
            'relative p-4 rounded-lg border shadow-lg max-w-sm',
            colors[type]
          )}
        >
          <div className="flex items-start space-x-3">
            {icons[type]}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
              {message && (
                <p className="mt-1 text-sm text-gray-600">{message}</p>
              )}
              {action && (
                <button
                  onClick={action.onClick}
                  className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  {action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => onClose?.(), 300);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Enhanced loading states
interface EnhancedLoadingProps {
  type?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const EnhancedLoading = ({
  type = 'spinner',
  size = 'md',
  text,
  className
}: EnhancedLoadingProps) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-pink-500 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        );
      case 'pulse':
        return (
          <motion.div
            className={cn('bg-pink-500 rounded-full', sizes[size])}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.5, 1]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        );
      case 'skeleton':
        return (
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
          </div>
        );
      default:
        return (
          <motion.div
            className={cn('border-2 border-pink-500 border-t-transparent rounded-full', sizes[size])}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        );
    }
  };

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
      {renderLoader()}
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-600"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

// Enhanced rating component
interface EnhancedRatingProps {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showValue?: boolean;
}

export const EnhancedRating = ({
  value,
  max = 5,
  onChange,
  size = 'md',
  readonly = false,
  showValue = false
}: EnhancedRatingProps) => {
  const [hoverValue, setHoverValue] = useState(0);

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(0);
    }
  };

  const displayValue = hoverValue || value;

  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: max }, (_, i) => (
        <motion.button
          key={i}
          onClick={() => handleClick(i + 1)}
          onMouseEnter={() => handleMouseEnter(i + 1)}
          onMouseLeave={handleMouseLeave}
          disabled={readonly}
          className={cn(
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2',
            readonly ? 'cursor-default' : 'cursor-pointer'
          )}
          whileHover={!readonly ? { scale: 1.1 } : {}}
          whileTap={!readonly ? { scale: 0.9 } : {}}
        >
          <Star
            className={cn(
              sizes[size],
              i < displayValue
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            )}
          />
        </motion.button>
      ))}
      {showValue && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="ml-2 text-sm font-medium text-gray-600"
        >
          {displayValue}/{max}
        </motion.span>
      )}
    </div>
  );
};

// Enhanced progress indicator
interface EnhancedProgressProps {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  striped?: boolean;
}

export const EnhancedProgress = ({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = false,
  animated = true,
  striped = false
}: EnhancedProgressProps) => {
  const percentage = Math.min((value / max) * 100, 100);

  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const variants = {
    default: 'bg-gradient-to-r from-blue-500 to-purple-500',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500'
  };

  return (
    <div className="w-full">
      <div className={cn(
        'relative bg-gray-200 rounded-full overflow-hidden',
        sizes[size]
      )}>
        <motion.div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            variants[variant],
            striped && 'bg-stripes'
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: animated ? 1 : 0.3, ease: "easeOut" }}
        />
        
        {/* Animated stripes */}
        {striped && (
          <motion.div
            className="absolute inset-0 bg-white opacity-20"
            style={{
              backgroundImage: 'linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.3) 25%, rgba(255,255,255,0.3) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.3) 75%, rgba(255,255,255,0.3))',
              backgroundSize: '20px 20px'
            }}
            animate={{ x: [0, 20] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        )}
      </div>
      
      {showLabel && (
        <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
          <span>Progress</span>
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            key={percentage}
          >
            {Math.round(percentage)}%
          </motion.span>
        </div>
      )}
    </div>
  );
};

// Enhanced status indicator
interface EnhancedStatusProps {
  status: 'online' | 'offline' | 'away' | 'busy';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

export const EnhancedStatus = ({
  status,
  size = 'md',
  showLabel = false,
  animated = true
}: EnhancedStatusProps) => {
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const colors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500'
  };

  const labels = {
    online: 'Online',
    offline: 'Offline',
    away: 'Away',
    busy: 'Busy'
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <div className={cn(
          'rounded-full',
          colors[status],
          sizes[size]
        )} />
        {animated && status === 'online' && (
          <motion.div
            className={cn(
              'absolute inset-0 rounded-full',
              colors[status]
            )}
            animate={{ scale: [1, 2, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>
      {showLabel && (
        <span className="text-sm text-gray-600">{labels[status]}</span>
      )}
    </div>
  );
}; 