import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Enhanced typography system for Phase 2

// Wedding-themed heading components
export const WeddingHeading = ({
  level = 1,
  children,
  className,
  animate = false,
  ...props
}: {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
} & React.HTMLAttributes<HTMLHeadingElement>) => {
  const baseClasses = 'font-serif text-blush-900 tracking-tight';
  
  const levelClasses = {
    1: 'text-4xl md:text-5xl lg:text-6xl font-bold leading-tight',
    2: 'text-3xl md:text-4xl font-semibold leading-tight',
    3: 'text-2xl md:text-3xl font-semibold leading-snug',
    4: 'text-xl md:text-2xl font-medium leading-snug',
    5: 'text-lg md:text-xl font-medium leading-normal',
    6: 'text-base md:text-lg font-medium leading-normal'
  };

  const Component = `h${level}` as keyof JSX.IntrinsicElements;

  const content = (
    <Component
      className={cn(baseClasses, levelClasses[level], className)}
    >
      {children}
    </Component>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

// Enhanced body text component
export const WeddingText = ({
  variant = 'body',
  children,
  className,
  ...props
}: {
  variant?: 'body' | 'lead' | 'small' | 'caption';
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLParagraphElement>) => {
  const variantClasses = {
    body: 'text-base leading-relaxed text-gray-700',
    lead: 'text-lg md:text-xl leading-relaxed text-gray-700 font-medium',
    small: 'text-sm leading-relaxed text-gray-600',
    caption: 'text-xs leading-relaxed text-gray-500 uppercase tracking-wide'
  };

  return (
    <p
      className={cn(variantClasses[variant], className)}
      {...props}
    >
      {children}
    </p>
  );
};

// Enhanced section component with consistent spacing
export const WeddingSection = ({
  children,
  className,
  spacing = 'default',
  animate = false,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  spacing?: 'tight' | 'default' | 'loose';
  animate?: boolean;
} & React.HTMLAttributes<HTMLElement>) => {
  const spacingClasses = {
    tight: 'py-8',
    default: 'py-12',
    loose: 'py-16'
  };

  const content = (
    <section
      className={cn(spacingClasses[spacing], className)}
      {...props}
    >
      {children}
    </section>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

// Enhanced container with consistent max-widths
export const WeddingContainer = ({
  children,
  className,
  size = 'default',
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'default' | 'lg' | 'xl';
} & React.HTMLAttributes<HTMLDivElement>) => {
  const sizeClasses = {
    sm: 'max-w-4xl',
    default: 'max-w-6xl',
    lg: 'max-w-7xl',
    xl: 'max-w-screen-2xl'
  };

  return (
    <div
      className={cn(
        'mx-auto px-4 sm:px-6 lg:px-8',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Enhanced grid system with consistent spacing
export const WeddingGrid = ({
  children,
  className,
  cols = 1,
  gap = 'default',
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'tight' | 'default' | 'loose';
} & React.HTMLAttributes<HTMLDivElement>) => {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  const gapClasses = {
    tight: 'gap-4',
    default: 'gap-6',
    loose: 'gap-8'
  };

  return (
    <div
      className={cn(
        'grid',
        colsClasses[cols],
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Enhanced card with consistent padding
export const WeddingCard = ({
  children,
  className,
  padding = 'default',
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  padding?: 'tight' | 'default' | 'loose';
} & React.HTMLAttributes<HTMLDivElement>) => {
  const paddingClasses = {
    tight: 'p-4',
    default: 'p-6',
    loose: 'p-8'
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-blush-100 shadow-sm',
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Enhanced list component
export const WeddingList = ({
  children,
  className,
  type = 'ul',
  spacing = 'default',
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  type?: 'ul' | 'ol';
  spacing?: 'tight' | 'default' | 'loose';
} & React.HTMLAttributes<HTMLUListElement | HTMLOListElement>) => {
  const spacingClasses = {
    tight: 'space-y-2',
    default: 'space-y-3',
    loose: 'space-y-4'
  };

  const Component = type;

  return (
    <Component
      className={cn(
        'list-none',
        spacingClasses[spacing],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

// Enhanced list item component
export const WeddingListItem = ({
  children,
  className,
  icon,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
} & React.HTMLAttributes<HTMLLIElement>) => {
  return (
    <li
      className={cn(
        'flex items-start space-x-3 text-gray-700',
        className
      )}
      {...props}
    >
      {icon && (
        <div className="flex-shrink-0 w-5 h-5 text-blush-500 mt-0.5">
          {icon}
        </div>
      )}
      <span className="flex-1">{children}</span>
    </li>
  );
};

// Enhanced badge component
export const WeddingBadge = ({
  children,
  variant = 'default',
  size = 'default',
  className,
  ...props
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
} & React.HTMLAttributes<HTMLSpanElement>) => {
  const variantClasses = {
    default: 'bg-blush-100 text-blush-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    default: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

// Enhanced divider component
export const WeddingDivider = ({
  className,
  orientation = 'horizontal',
  ...props
}: {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
} & React.HTMLAttributes<HTMLDivElement>) => {
  const orientationClasses = {
    horizontal: 'w-full h-px bg-blush-200',
    vertical: 'h-full w-px bg-blush-200'
  };

  return (
    <div
      className={cn(orientationClasses[orientation], className)}
      {...props}
    />
  );
};

// Enhanced spacing utilities
export const WeddingSpacer = ({
  size = 'default',
  className,
  ...props
}: {
  size?: 'xs' | 'sm' | 'default' | 'lg' | 'xl' | '2xl';
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const sizeClasses = {
    xs: 'h-2',
    sm: 'h-4',
    default: 'h-6',
    lg: 'h-8',
    xl: 'h-12',
    '2xl': 'h-16'
  };

  return (
    <div
      className={cn(sizeClasses[size], className)}
      {...props}
    />
  );
}; 