import React from 'react';
import { LucideIcon, Plus, Search, Heart, Users, Calendar } from 'lucide-react';
import { EnhancedButton } from './enhanced-button';
import { EnhancedCard } from './enhanced-card';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'wedding' | 'champagne' | 'outline';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  illustration?: 'guests' | 'tasks' | 'budget' | 'vendors' | 'timeline';
}

const illustrations = {
  guests: Users,
  tasks: Calendar,
  budget: Heart,
  vendors: Search,
  timeline: Plus,
};

export function EmptyState({ 
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  illustration = 'tasks'
}: EmptyStateProps) {
  const IllustrationIcon = Icon || illustrations[illustration];

  return (
    <EnhancedCard 
      variant="elegant" 
      className={cn(
        "flex flex-col items-center justify-center text-center p-12 min-h-[400px]",
        className
      )}
    >
      <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
        <IllustrationIcon className="w-8 h-8 text-rose-500" aria-hidden="true" />
      </div>
      
      <h3 className="text-xl font-semibold text-neutral-900 mb-2">
        {title}
      </h3>
      
      <p className="text-neutral-600 max-w-md mb-8 leading-relaxed">
        {description}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        {action && (
          <EnhancedButton
            variant={action.variant || 'wedding'}
            onClick={action.onClick}
            size="lg"
            data-testid="empty-state-primary-action"
          >
            {action.label}
          </EnhancedButton>
        )}
        
        {secondaryAction && (
          <EnhancedButton
            variant="outline"
            onClick={secondaryAction.onClick}
            size="lg"
            data-testid="empty-state-secondary-action"
          >
            {secondaryAction.label}
          </EnhancedButton>
        )}
      </div>
    </EnhancedCard>
  );
}

// Specialized empty states for common scenarios
export function GuestListEmptyState({ onAddGuest }: { onAddGuest: () => void }) {
  return (
    <EmptyState
      illustration="guests"
      title="No guests yet"
      description="Start building your guest list by adding your first guest. You can import from spreadsheets or add them one by one."
      action={{
        label: "Add Your First Guest",
        onClick: onAddGuest,
      }}
      secondaryAction={{
        label: "Import Guest List",
        onClick: () => {/* TODO: Implement import */},
      }}
    />
  );
}

export function TaskListEmptyState({ onAddTask }: { onAddTask: () => void }) {
  return (
    <EmptyState
      illustration="tasks"
      title="All caught up!"
      description="You don't have any pending tasks. Great job staying on top of your wedding planning!"
      action={{
        label: "Add New Task",
        onClick: onAddTask,
      }}
    />
  );
}

export function BudgetEmptyState({ onAddExpense }: { onAddExpense: () => void }) {
  return (
    <EmptyState
      illustration="budget"
      title="Start tracking your budget"
      description="Keep your wedding expenses organized by adding your first budget item. Track spending across categories like venue, catering, and more."
      action={{
        label: "Add First Expense",
        onClick: onAddExpense,
      }}
    />
  );
}

export function VendorListEmptyState({ onAddVendor }: { onAddVendor: () => void }) {
  return (
    <EmptyState
      illustration="vendors"
      title="No vendors added"
      description="Start organizing your wedding team by adding vendors like photographers, florists, and caterers."
      action={{
        label: "Add Vendor",
        onClick: onAddVendor,
      }}
      secondaryAction={{
        label: "Browse Recommendations",
        onClick: () => {/* TODO: Implement recommendations */},
      }}
    />
  );
}