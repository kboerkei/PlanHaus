import { ReactNode } from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

export function Skeleton({ className = '', width, height, rounded = false }: SkeletonProps) {
  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <div
      className={`
        animate-pulse bg-gray-200 
        ${rounded ? 'rounded-full' : 'rounded'}
        ${className}
      `}
      style={style}
    />
  );
}

interface SkeletonCardProps {
  lines?: number;
  showAvatar?: boolean;
  className?: string;
}

export function SkeletonCard({ lines = 3, showAvatar = false, className = '' }: SkeletonCardProps) {
  return (
    <div className={`bg-white rounded-lg border p-4 ${className}`}>
      {showAvatar && (
        <div className="flex items-center gap-3 mb-4">
          <Skeleton width={40} height={40} rounded />
          <div className="flex-1">
            <Skeleton height={16} className="mb-2" />
            <Skeleton height={12} width="60%" />
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton 
            key={i} 
            height={12} 
            width={i === lines - 1 ? '80%' : '100%'} 
          />
        ))}
      </div>
    </div>
  );
}

interface SkeletonListProps {
  count?: number;
  showAvatar?: boolean;
  className?: string;
}

export function SkeletonList({ count = 5, showAvatar = false, className = '' }: SkeletonListProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} showAvatar={showAvatar} />
      ))}
    </div>
  );
}

interface SkeletonWrapperProps {
  isLoading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
}

export function SkeletonWrapper({ isLoading, skeleton, children }: SkeletonWrapperProps) {
  if (isLoading) {
    return <>{skeleton}</>;
  }
  
  return <>{children}</>;
}