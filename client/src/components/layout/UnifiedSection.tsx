import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/design-system';
import { unifiedTheme } from '@/design-system/unified-theme';

interface UnifiedSectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elegant' | 'glass';
  animation?: 'fadeIn' | 'slideUp' | 'scaleIn' | 'none';
}

export const UnifiedSection: React.FC<UnifiedSectionProps> = ({
  title,
  subtitle,
  children,
  className = '',
  variant = 'default',
  animation = 'fadeIn',
}) => {
  const getAnimationVariant = () => {
    switch (animation) {
      case 'fadeIn':
        return unifiedTheme.motionVariants.fadeIn;
      case 'slideUp':
        return unifiedTheme.motionVariants.slideUp;
      case 'scaleIn':
        return unifiedTheme.motionVariants.scaleIn;
      case 'none':
        return { initial: {}, animate: {}, exit: {} };
      default:
        return unifiedTheme.motionVariants.fadeIn;
    }
  };

  return (
    <motion.section
      className={`unified-section mb-8 ${className}`}
      variants={getAnimationVariant()}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <motion.h2 
              className="text-2xl md:text-3xl font-serif font-semibold text-gray-800 mb-2"
              variants={unifiedTheme.motionVariants.slideUp}
            >
              {title}
            </motion.h2>
          )}
          {subtitle && (
            <motion.p 
              className="text-gray-600 max-w-3xl"
              variants={unifiedTheme.motionVariants.slideUp}
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      )}
      <motion.div
        variants={unifiedTheme.motionVariants.stagger}
        className="unified-section-content"
      >
        {children}
      </motion.div>
    </motion.section>
  );
};

interface UnifiedGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}

export const UnifiedGrid: React.FC<UnifiedGridProps> = ({
  children,
  className = '',
  cols = 1,
  gap = 'md',
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const gridGap = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  };

  return (
    <div className={`grid ${gridCols[cols]} ${gridGap[gap]} ${className}`}>
      {children}
    </div>
  );
};

interface UnifiedCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elegant' | 'glass';
  padding?: 'none' | 'sm' | 'default' | 'lg';
  hover?: boolean;
}

export const UnifiedCard: React.FC<UnifiedCardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'default',
  hover = true,
}) => {
  return (
    <motion.div
      className={hover ? 'group' : ''}
      whileHover={hover ? { y: -4, scale: 1.02 } : undefined}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Card 
        variant={variant} 
        padding={padding}
        className={`${className} ${hover ? 'transition-all duration-200 group-hover:shadow-lg' : ''}`}
      >
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export { UnifiedSection as default }; 