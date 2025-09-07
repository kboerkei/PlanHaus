import React from 'react';
import { cn } from '../../lib/utils';

interface SectionCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
  error?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  description,
  children,
  className,
  required = false,
  error,
}) => {
  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 p-6", className)}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          {title}
          {required && (
            <span className="text-red-500 text-sm font-normal">*</span>
          )}
        </h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
      
      <div className="space-y-4">
        {children}
      </div>
      
      {error && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </div>
      )}
    </div>
  );
};

// Subsection component for nested sections
interface SubsectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export const Subsection: React.FC<SubsectionProps> = ({
  title,
  children,
  className,
  collapsible = false,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  if (!collapsible) {
    return (
      <div className={cn("border-l-4 border-gray-200 pl-4", className)}>
        <h4 className="text-md font-medium text-gray-800 mb-3">{title}</h4>
        <div className="space-y-3">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("border border-gray-200 rounded-md", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
      >
        <h4 className="text-md font-medium text-gray-800">{title}</h4>
        <svg
          className={cn(
            "h-5 w-5 text-gray-500 transition-transform",
            isOpen ? "rotate-180" : ""
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="px-4 pb-4 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}; 