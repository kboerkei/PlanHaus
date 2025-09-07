import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Wedding-themed skeleton loaders for Phase 2
export const WeddingSkeletonCard = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="bg-white rounded-xl border border-blush-100 p-6 shadow-sm"
  >
    <div className="animate-pulse space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blush-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-blush-200 rounded w-3/4" />
          <div className="h-3 bg-blush-100 rounded w-1/2" />
        </div>
      </div>
      
      {/* Content */}
      <div className="space-y-3">
        <div className="h-4 bg-blush-200 rounded" />
        <div className="h-4 bg-blush-200 rounded w-5/6" />
        <div className="h-4 bg-blush-200 rounded w-4/6" />
      </div>
      
      {/* Footer */}
      <div className="flex justify-between items-center pt-4">
        <div className="flex space-x-2">
          <div className="w-16 h-6 bg-blush-200 rounded-full" />
          <div className="w-20 h-6 bg-blush-200 rounded-full" />
        </div>
        <div className="w-24 h-8 bg-blush-200 rounded-lg" />
      </div>
    </div>
  </motion.div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Quick Stats Bar */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white rounded-xl border border-blush-100 p-6 shadow-sm"
        >
          <div className="animate-pulse space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 bg-blush-200 rounded-lg" />
              <div className="w-16 h-4 bg-blush-200 rounded" />
            </div>
            <div className="h-8 bg-blush-200 rounded w-3/4" />
            <div className="h-3 bg-blush-100 rounded w-1/2" />
          </div>
        </motion.div>
      ))}
    </div>
    
    {/* Main Content */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <WeddingSkeletonCard />
      <WeddingSkeletonCard />
    </div>
  </div>
);

export const BudgetSkeleton = () => (
  <div className="space-y-6">
    {/* Budget Overview */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-xl border border-blush-100 p-6 shadow-sm"
    >
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-blush-200 rounded w-1/3" />
        <div className="h-12 bg-blush-200 rounded-lg" />
        <div className="flex justify-between">
          <div className="h-4 bg-blush-200 rounded w-1/4" />
          <div className="h-4 bg-blush-200 rounded w-1/4" />
        </div>
      </div>
    </motion.div>
    
    {/* Budget Categories */}
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white rounded-lg border border-blush-100 p-4"
        >
          <div className="animate-pulse space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-5 bg-blush-200 rounded w-1/3" />
              <div className="h-5 bg-blush-200 rounded w-1/6" />
            </div>
            <div className="h-3 bg-blush-100 rounded-full overflow-hidden">
              <div className="h-full bg-blush-200 rounded-full w-2/3" />
            </div>
            <div className="flex justify-between text-sm">
              <div className="h-3 bg-blush-200 rounded w-1/4" />
              <div className="h-3 bg-blush-200 rounded w-1/4" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

export const GuestListSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05 }}
        className="bg-white rounded-lg border border-blush-100 p-4"
      >
        <div className="animate-pulse flex items-center space-x-4">
          <div className="w-12 h-12 bg-blush-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-blush-200 rounded w-1/3" />
            <div className="h-3 bg-blush-100 rounded w-1/2" />
          </div>
          <div className="flex space-x-2">
            <div className="w-16 h-8 bg-blush-200 rounded-full" />
            <div className="w-16 h-8 bg-blush-200 rounded-full" />
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

export const TimelineSkeleton = () => (
  <div className="space-y-6">
    {/* Timeline Header */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-between"
    >
      <div className="animate-pulse space-y-2">
        <div className="h-6 bg-blush-200 rounded w-1/4" />
        <div className="h-4 bg-blush-100 rounded w-1/3" />
      </div>
      <div className="w-32 h-10 bg-blush-200 rounded-lg" />
    </motion.div>
    
    {/* Timeline Items */}
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-start space-x-4"
        >
          <div className="animate-pulse">
            <div className="w-4 h-4 bg-blush-200 rounded-full" />
            {i < 4 && <div className="w-0.5 h-16 bg-blush-200 mx-auto mt-2" />}
          </div>
          <div className="flex-1 bg-white rounded-lg border border-blush-100 p-4">
            <div className="animate-pulse space-y-3">
              <div className="flex justify-between items-start">
                <div className="h-5 bg-blush-200 rounded w-1/3" />
                <div className="w-20 h-6 bg-blush-200 rounded-full" />
              </div>
              <div className="h-4 bg-blush-200 rounded w-2/3" />
              <div className="flex space-x-2">
                <div className="w-16 h-6 bg-blush-200 rounded-full" />
                <div className="w-20 h-6 bg-blush-200 rounded-full" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

export const VendorSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: i * 0.1 }}
        className="bg-white rounded-xl border border-blush-100 overflow-hidden shadow-sm"
      >
        <div className="animate-pulse">
          {/* Image placeholder */}
          <div className="h-48 bg-blush-200" />
          
          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="h-5 bg-blush-200 rounded w-3/4" />
            <div className="h-4 bg-blush-200 rounded w-1/2" />
            <div className="space-y-2">
              <div className="h-3 bg-blush-100 rounded w-full" />
              <div className="h-3 bg-blush-100 rounded w-5/6" />
            </div>
            <div className="flex justify-between items-center pt-2">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div key={star} className="w-4 h-4 bg-blush-200 rounded" />
                ))}
              </div>
              <div className="w-20 h-8 bg-blush-200 rounded-lg" />
            </div>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

// Page-level skeleton for full page loading
export const PageSkeleton = ({ type = 'dashboard' }: { type?: string }) => {
  const skeletons = {
    dashboard: <DashboardSkeleton />,
    budget: <BudgetSkeleton />,
    guests: <GuestListSkeleton />,
    timeline: <TimelineSkeleton />,
    vendors: <VendorSkeleton />
  };
  
  return (
    <div className="min-h-screen bg-blush-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-blush-200 rounded w-1/4" />
            <div className="h-4 bg-blush-100 rounded w-1/3" />
          </div>
        </motion.div>
        
        {/* Page Content */}
        {skeletons[type as keyof typeof skeletons] || <DashboardSkeleton />}
      </div>
    </div>
  );
};

// Wedding-themed loading spinner
export const WeddingSpinner = ({ size = 'md', text }: { size?: 'sm' | 'md' | 'lg', text?: string }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
  
  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className={cn('text-blush-500', sizeClasses[size])}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            fill="currentColor"
            opacity="0.2"
          />
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            fill="currentColor"
            strokeDasharray="60"
            strokeDashoffset="60"
            strokeLinecap="round"
            strokeWidth="2"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="60;0"
              dur="2s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </motion.div>
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-blush-600 text-sm font-medium"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}; 