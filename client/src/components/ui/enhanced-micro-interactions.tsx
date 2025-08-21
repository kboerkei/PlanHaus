import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Heart, Sparkles, CheckCircle, Star, Zap, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

// Celebration component for achievements
interface CelebrationProps {
  isVisible: boolean;
  onComplete?: () => void;
  type?: 'success' | 'milestone' | 'achievement';
  message?: string;
}

export const Celebration = ({ 
  isVisible, 
  onComplete, 
  type = 'success',
  message = 'Great job!' 
}: CelebrationProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    if (isVisible) {
      // Generate random particles
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
      }));
      setParticles(newParticles);

      // Auto-hide after animation
      const timer = setTimeout(() => {
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  const getIcon = () => {
    switch (type) {
      case 'milestone': return <Star className="h-8 w-8 text-yellow-500" />;
      case 'achievement': return <Gift className="h-8 w-8 text-purple-500" />;
      default: return <CheckCircle className="h-8 w-8 text-green-500" />;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          {/* Background overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black"
          />

          {/* Celebration content */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="relative bg-white rounded-2xl p-8 shadow-2xl text-center"
          >
            <motion.div
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 0.6 }}
            >
              {getIcon()}
            </motion.div>
            
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-xl font-semibold text-gray-800"
            >
              {message}
            </motion.h3>

            {/* Floating particles */}
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  opacity: 1,
                  scale: 0
                }}
                animate={{ 
                  x: particle.x, 
                  y: particle.y, 
                  opacity: 0,
                  scale: 1
                }}
                transition={{ 
                  duration: 2,
                  ease: "easeOut"
                }}
                className="absolute"
              >
                <Sparkles className="h-4 w-4 text-pink-400" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Interactive button with micro-animations
interface InteractiveButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

export const InteractiveButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className,
  disabled = false,
  loading = false
}: InteractiveButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const scale = useMotionValue(1);
  const rotate = useMotionValue(0);

  const handleMouseDown = () => {
    if (!disabled && !loading) {
      setIsPressed(true);
      scale.set(0.95);
    }
  };

  const handleMouseUp = () => {
    setIsPressed(false);
    scale.set(1);
  };

  const handleHoverStart = () => {
    if (!disabled && !loading) {
      setIsHovered(true);
      scale.set(1.05);
    }
  };

  const handleHoverEnd = () => {
    setIsHovered(false);
    scale.set(1);
  };

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      rotate.set(360);
      onClick();
    }
  };

  const variants = {
    primary: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <motion.button
      style={{ scale, rotate }}
      animate={{ rotate: 0 }}
      transition={{ duration: 0.3 }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      onClick={handleClick}
      disabled={disabled || loading}
      className={cn(
        'relative overflow-hidden rounded-lg font-medium transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {/* Ripple effect */}
      {isPressed && (
        <motion.div
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-white rounded-full"
        />
      )}

      {/* Loading spinner */}
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
        </motion.div>
      )}

      <span className={cn(loading && 'opacity-0')}>
        {children}
      </span>
    </motion.button>
  );
};

// Floating action button with heart beat animation
interface FloatingActionButtonProps {
  onClick?: () => void;
  icon?: React.ReactNode;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const FloatingActionButton = ({
  onClick,
  icon = <Heart className="h-5 w-5" />,
  label,
  position = 'bottom-right'
}: FloatingActionButtonProps) => {
  const positions = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'fixed z-40 p-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full shadow-lg',
        'hover:shadow-xl transition-shadow duration-200',
        positions[position]
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {icon}
      </motion.div>
      
      {label && (
        <motion.span
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded whitespace-nowrap"
        >
          {label}
        </motion.span>
      )}
    </motion.button>
  );
};

// Progress indicator with animated fill
interface AnimatedProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  animated?: boolean;
}

export const AnimatedProgress = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  animated = true
}: AnimatedProgressProps) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const progress = useMotionValue(0);
  const width = useTransform(progress, (value) => `${value}%`);

  useEffect(() => {
    if (animated) {
      progress.set(percentage);
    } else {
      progress.set(percentage);
    }
  }, [percentage, progress, animated]);

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
            variants[variant]
          )}
          style={{ width }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: animated ? 1 : 0.3, ease: "easeOut" }}
        />
      </div>
      
      {showLabel && (
        <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
};

// Shimmer loading effect
interface ShimmerProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export const Shimmer = ({ className, width, height }: ShimmerProps) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200',
        'bg-[length:200%_100%] animate-shimmer',
        className
      )}
      style={{ width, height }}
    />
  );
};

// Pulse notification dot
interface PulseDotProps {
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PulseDot = ({ color = 'bg-red-500', size = 'md' }: PulseDotProps) => {
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className="relative">
      <div className={cn(
        'rounded-full',
        color,
        sizes[size]
      )} />
      <motion.div
        className={cn(
          'absolute inset-0 rounded-full',
          color
        )}
        animate={{ scale: [1, 2, 1], opacity: [1, 0, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
}; 