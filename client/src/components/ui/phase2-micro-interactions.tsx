import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Enhanced micro-interactions for Phase 2

// Wedding-themed celebration component
export const WeddingCelebration = ({ 
  isVisible, 
  type = 'success',
  message = 'Task completed!',
  onComplete 
}: {
  isVisible: boolean;
  type?: 'success' | 'milestone' | 'achievement';
  message?: string;
  onComplete?: () => void;
}) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  React.useEffect(() => {
    if (isVisible) {
      // Generate particles
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100
      }));
      setParticles(newParticles);

      // Auto-dismiss after 3 seconds
      const timer = setTimeout(() => {
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  const celebrationVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.3 }
    }
  };

  const particleVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: (i: number) => ({
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      x: particles[i]?.x || 0,
      y: particles[i]?.y || 0,
      transition: {
        duration: 2,
        delay: i * 0.1,
        ease: "easeOut"
      }
    })
  };

  const typeConfig = {
    success: { color: 'text-green-500', icon: '🎉' },
    milestone: { color: 'text-blush-500', icon: '💍' },
    achievement: { color: 'text-amber-500', icon: '🏆' }
  };

  const config = typeConfig[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={celebrationVariants}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          {/* Celebration content */}
          <motion.div className="relative z-10 text-center">
            {/* Main icon */}
            <motion.div
              className={cn('text-6xl mb-4', config.color)}
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 1,
                repeat: 2,
                ease: "easeInOut"
              }}
            >
              {config.icon}
            </motion.div>
            
            {/* Message */}
            <motion.p
              className={cn('text-xl font-semibold mb-2', config.color)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {message}
            </motion.p>
            
            {/* Particles */}
            <div className="absolute inset-0 -z-10">
              {particles.map((particle, i) => (
                <motion.div
                  key={particle.id}
                  className="absolute w-2 h-2 bg-blush-400 rounded-full"
                  custom={i}
                  variants={particleVariants}
                  initial="hidden"
                  animate="visible"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Enhanced interactive button with ripple effect
export const InteractiveButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className,
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    // Create ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = {
      id: Date.now(),
      x,
      y
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);

    onClick?.();
  };

  const variants = {
    primary: 'bg-blush-500 hover:bg-blush-600 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-white hover:bg-blush-50 text-blush-600 border-2 border-blush-200 hover:border-blush-300',
    success: 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg hover:shadow-xl'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={handleClick}
      disabled={disabled || loading}
      className={cn(
        'relative overflow-hidden rounded-lg font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blush-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none"
          initial={{ 
            scale: 0, 
            opacity: 0.5,
            x: ripple.x,
            y: ripple.y,
            transform: 'translate(-50%, -50%)'
          }}
          animate={{ 
            scale: 4, 
            opacity: 0 
          }}
          transition={{ duration: 0.6 }}
        />
      ))}

      {/* Loading spinner */}
      {loading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
          />
        </motion.div>
      )}

      <span className={cn(loading && 'opacity-0')}>
        {children}
      </span>
    </motion.button>
  );
};

// Floating action button with heart beat animation
export const FloatingActionButton = ({
  onClick,
  icon,
  label,
  position = 'bottom-right',
  className
}: {
  onClick?: () => void;
  icon: React.ReactNode;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
}) => {
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  return (
    <motion.button
      className={cn(
        'fixed z-40 w-14 h-14 bg-blush-500 text-white rounded-full shadow-lg',
        'flex items-center justify-center hover:bg-blush-600',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blush-500',
        positionClasses[position],
        className
      )}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      title={label}
    >
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {icon}
      </motion.div>
    </motion.button>
  );
};

// Enhanced progress indicator with animations
export const AnimatedProgress = ({
  value,
  max = 100,
  label,
  variant = 'default',
  showPercentage = true,
  className
}: {
  value: number;
  max?: number;
  label?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showPercentage?: boolean;
  className?: string;
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const variantClasses = {
    default: 'bg-blush-500',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500'
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-500">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', variantClasses[variant])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.div
            className="h-full w-full"
            animate={{
              background: [
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              backgroundSize: '200% 100%',
              backgroundPosition: '0% 0%'
            }}
          />
        </motion.div>
      </div>
    </div>
  );
};

// Enhanced card with hover animations
export const AnimatedCard = ({
  children,
  className,
  hoverEffect = true
}: {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}) => {
  return (
    <motion.div
      className={cn(
        'bg-white rounded-xl border border-blush-100 p-6 shadow-sm',
        'transition-all duration-300',
        className
      )}
      whileHover={hoverEffect ? { 
        y: -4, 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      } : {}}
    >
      {children}
    </motion.div>
  );
};

// Enhanced input with focus animations
export const AnimatedInput = ({
  label,
  error,
  className,
  ...props
}: {
  label?: string;
  error?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-2">
      {label && (
        <motion.label
          className="block text-sm font-medium text-gray-700"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {label}
        </motion.label>
      )}
      
      <motion.div
        className="relative"
        animate={{
          scale: isFocused ? 1.02 : 1
        }}
        transition={{ duration: 0.2 }}
      >
        <input
          className={cn(
            'w-full px-4 py-3 border-2 rounded-lg transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-blush-500 focus:ring-offset-2',
            isFocused ? 'border-blush-500' : 'border-blush-200',
            error ? 'border-red-500' : '',
            className
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {isFocused && (
          <motion.div
            className="absolute inset-0 border-2 border-blush-500 rounded-lg pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          />
        )}
      </motion.div>
      
      {error && (
        <motion.p
          className="text-sm text-red-600"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}; 