import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Lightbulb, 
  Star,
  Heart,
  Users,
  Calendar,
  DollarSign,
  MapPin,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Interactive tooltip with rich content
interface InteractiveTooltipProps {
  content: string | React.ReactNode;
  title?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click';
  children: React.ReactNode;
  className?: string;
  showArrow?: boolean;
}

export const InteractiveTooltip = ({
  content,
  title,
  position = 'top',
  trigger = 'hover',
  children,
  className,
  showArrow = true
}: InteractiveTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      clearTimeout(timeoutRef.current);
      setIsVisible(true);
      setIsMounted(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setIsMounted(false), 200);
      }, 100);
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
      setIsMounted(!isVisible);
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-800';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-800';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-800';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-800';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-800';
    }
  };

  return (
    <div
      className={cn('relative inline-block', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}
      
      <AnimatePresence>
        {isMounted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.95, y: isVisible ? 0 : 5 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute z-50 w-64 bg-gray-800 text-white rounded-lg shadow-lg p-3',
              getPositionClasses()
            )}
          >
            {title && (
              <div className="font-medium text-sm mb-1">{title}</div>
            )}
            <div className="text-sm leading-relaxed">
              {content}
            </div>
            {showArrow && (
              <div
                className={cn(
                  'absolute w-0 h-0 border-4 border-transparent',
                  getArrowClasses()
                )}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Smart empty state with contextual suggestions
interface SmartEmptyStateProps {
  type: 'guests' | 'tasks' | 'budget' | 'vendors' | 'timeline' | 'inspiration';
  title: string;
  description: string;
  suggestions?: string[];
  actions?: Array<{
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<any>;
    variant?: 'primary' | 'secondary' | 'outline';
  }>;
  showTips?: boolean;
  className?: string;
}

export const SmartEmptyState = ({
  type,
  title,
  description,
  suggestions = [],
  actions = [],
  showTips = true,
  className
}: SmartEmptyStateProps) => {
  const [showTipsState, setShowTipsState] = useState(showTips);

  const getIcon = () => {
    switch (type) {
      case 'guests': return <Users className="w-12 h-12 text-blue-500" />;
      case 'tasks': return <Calendar className="w-12 h-12 text-green-500" />;
      case 'budget': return <DollarSign className="w-12 h-12 text-yellow-500" />;
      case 'vendors': return <MapPin className="w-12 h-12 text-purple-500" />;
      case 'timeline': return <Calendar className="w-12 h-12 text-indigo-500" />;
      case 'inspiration': return <Heart className="w-12 h-12 text-pink-500" />;
      default: return <Info className="w-12 h-12 text-gray-500" />;
    }
  };

  const getTips = () => {
    switch (type) {
      case 'guests':
        return [
          "Start with immediate family and close friends",
          "Consider your venue capacity when planning",
          "Use the RSVP tracker to monitor responses",
          "Group guests by relationship for easier management"
        ];
      case 'tasks':
        return [
          "Break down large tasks into smaller steps",
          "Set realistic deadlines for each task",
          "Prioritize tasks by importance and urgency",
          "Use the timeline view to see your progress"
        ];
      case 'budget':
        return [
          "Allocate 40-50% of your budget to venue and catering",
          "Set aside 10-15% for photography and videography",
          "Plan for unexpected expenses with a 10% buffer",
          "Track all expenses to stay within budget"
        ];
      case 'vendors':
        return [
          "Research and compare multiple vendors",
          "Read reviews and ask for references",
          "Get everything in writing with contracts",
          "Book popular vendors 6-12 months in advance"
        ];
      default:
        return suggestions;
    }
  };

  const tips = suggestions.length > 0 ? suggestions : getTips();

  return (
    <div className={cn(
      "text-center py-12 px-6 max-w-2xl mx-auto",
      className
    )}>
      <div className="mb-6">
        {getIcon()}
      </div>
      
      <h3 className="text-2xl font-semibold text-gray-900 mb-3">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-8 leading-relaxed">
        {description}
      </p>

      {/* Action Buttons */}
      {actions.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={cn(
                "flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200",
                action.variant === 'primary'
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg transform hover:-translate-y-0.5"
                  : action.variant === 'secondary'
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
              )}
            >
              {action.icon && <action.icon className="w-4 h-4 mr-2" />}
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Tips Section */}
      {showTipsState && tips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900 flex items-center">
              <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
              Pro Tips
            </h4>
            <button
              onClick={() => setShowTipsState(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <ul className="space-y-2 text-left">
            {tips.map((tip, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start text-sm text-gray-700"
              >
                <Star className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                {tip}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
};

// Contextual help sidebar
interface HelpSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
}

export const HelpSidebar = ({
  isOpen,
  onClose,
  title = 'Help & Tips',
  children,
  position = 'right'
}: HelpSidebarProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ 
              x: position === 'right' ? '100%' : '-100%',
              opacity: 0 
            }}
            animate={{ 
              x: 0,
              opacity: 1 
            }}
            exit={{ 
              x: position === 'right' ? '100%' : '-100%',
              opacity: 0 
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              "fixed top-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto",
              position === 'right' ? 'right-0' : 'left-0'
            )}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Progress indicator with milestones
interface Milestone {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
  date?: string;
  icon?: React.ComponentType<any>;
}

interface ProgressMilestonesProps {
  milestones: Milestone[];
  currentMilestone?: string;
  onMilestoneClick?: (milestoneId: string) => void;
  showDates?: boolean;
  className?: string;
}

export const ProgressMilestones = ({
  milestones,
  currentMilestone,
  onMilestoneClick,
  showDates = true,
  className
}: ProgressMilestonesProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      {milestones.map((milestone, index) => (
        <motion.div
          key={milestone.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            "flex items-start space-x-4 p-4 rounded-lg border transition-all duration-200 cursor-pointer",
            milestone.isCompleted
              ? "bg-green-50 border-green-200"
              : milestone.isActive
              ? "bg-blue-50 border-blue-200 shadow-sm"
              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
          )}
          onClick={() => onMilestoneClick?.(milestone.id)}
        >
          <div className="flex-shrink-0">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200",
                milestone.isCompleted
                  ? "bg-green-500 border-green-500 text-white"
                  : milestone.isActive
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "bg-gray-200 border-gray-300 text-gray-500"
              )}
            >
              {milestone.isCompleted ? (
                <CheckCircle className="w-5 h-5" />
              ) : milestone.icon ? (
                <milestone.icon className="w-5 h-5" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className={cn(
                "text-sm font-medium",
                milestone.isCompleted
                  ? "text-green-800"
                  : milestone.isActive
                  ? "text-blue-800"
                  : "text-gray-700"
              )}>
                {milestone.title}
              </h3>
              {showDates && milestone.date && (
                <span className="text-xs text-gray-500">
                  {milestone.date}
                </span>
              )}
            </div>
            <p className={cn(
              "text-sm mt-1",
              milestone.isCompleted
                ? "text-green-600"
                : milestone.isActive
                ? "text-blue-600"
                : "text-gray-500"
            )}>
              {milestone.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Smart form guidance
interface FormGuidanceProps {
  fieldName: string;
  currentValue: string;
  suggestions?: string[];
  examples?: string[];
  helpText?: string;
  onSuggestionClick?: (suggestion: string) => void;
  className?: string;
}

export const FormGuidance = ({
  fieldName,
  currentValue,
  suggestions = [],
  examples = [],
  helpText,
  onSuggestionClick,
  className
}: FormGuidanceProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredSuggestions = suggestions.filter(
    suggestion => suggestion.toLowerCase().includes(currentValue.toLowerCase())
  );

  return (
    <div className={cn("space-y-3", className)}>
      {helpText && (
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <Info className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
            <p>{helpText}</p>
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ChevronRight className={cn(
              "w-4 h-4 mr-1 transition-transform duration-200",
              isExpanded && "rotate-90"
            )} />
            Suggestions ({filteredSuggestions.length})
          </button>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 space-y-1"
              >
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => onSuggestionClick?.(suggestion)}
                    className="block w-full text-left text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {examples.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Examples:</h4>
          <div className="space-y-1">
            {examples.map((example, index) => (
              <div key={index} className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                {example}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 