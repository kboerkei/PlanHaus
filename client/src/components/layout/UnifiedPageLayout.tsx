import React from 'react';
import { motion } from 'framer-motion';
import { unifiedTheme } from '@/design-system/unified-theme';
import { Card, CardContent } from '@/components/design-system';

interface UnifiedPageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
  headerBackground?: 'gradient' | 'solid' | 'transparent';
  animation?: 'fadeIn' | 'slideUp' | 'scaleIn' | 'none';
  container?: boolean;
}

export const UnifiedPageLayout: React.FC<UnifiedPageLayoutProps> = ({
  title,
  subtitle,
  children,
  className = '',
  showHeader = true,
  headerBackground = 'gradient',
  animation = 'fadeIn',
  container = true,
}) => {
  const getHeaderBackground = () => {
    switch (headerBackground) {
      case 'gradient':
        return 'gradient-wedding-elegant';
      case 'solid':
        return 'bg-blush/5';
      case 'transparent':
        return 'bg-transparent';
      default:
        return 'gradient-wedding-elegant';
    }
  };

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

  const content = (
    <motion.div
      className={`unified-page min-h-screen bg-cream ${className}`}
      variants={getAnimationVariant()}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {showHeader && (
        <motion.header
          className={`page-header ${getHeaderBackground()} py-12 border-b border-blush/10`}
          variants={unifiedTheme.motionVariants.fadeIn}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h1
              className="page-title font-serif text-4xl md:text-5xl font-semibold text-gray-800 mb-4"
              variants={unifiedTheme.motionVariants.slideUp}
            >
              {title}
            </motion.h1>
            {subtitle && (
              <motion.p
                className="page-subtitle text-lg text-gray-600 max-w-2xl"
                variants={unifiedTheme.motionVariants.slideUp}
              >
                {subtitle}
              </motion.p>
            )}
          </div>
        </motion.header>
      )}
      
      <motion.main
        className="page-content py-8"
        variants={unifiedTheme.motionVariants.stagger}
      >
        {container ? (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        ) : (
          children
        )}
      </motion.main>
    </motion.div>
  );

  return content;
};

export default UnifiedPageLayout; 