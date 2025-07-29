import { memo, useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce, usePerformanceMonitor } from '@/hooks/usePerformance';
import { SkeletonList } from '@/components/ui/SkeletonLoader';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import EmptyState from '@/components/ui/EmptyState';
import { sanitizeText } from '@/utils/sanitize';
import { DollarSign, PieChart, Plus } from 'lucide-react';

interface BudgetItem {
  id: number;
  category: string;
  itemName: string;
  estimatedCost: number;
  actualCost: number;
  vendor?: string;
  notes?: string;
  isPaid: boolean;
}

interface EnhancedBudgetPageProps {
  projectId: number;
}

// Memoized budget item card
const BudgetItemCard = memo(({ 
  item, 
  onEdit, 
  onDelete 
}: { 
  item: BudgetItem; 
  onEdit: (item: BudgetItem) => void; 
  onDelete: (id: number) => void;
}) => (
  <div className="bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-all duration-200">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{sanitizeText(item.itemName)}</h3>
        <p className="text-sm text-gray-500">{sanitizeText(item.category)}</p>
      </div>
      <div className="text-right">
        <p className="font-semibold text-gray-900">
          ${item.actualCost > 0 ? item.actualCost.toLocaleString() : item.estimatedCost.toLocaleString()}
        </p>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          item.isPaid 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {item.isPaid ? 'Paid' : 'Pending'}
        </span>
      </div>
    </div>
    
    {item.vendor && (
      <p className="text-sm text-gray-600 mb-2">
        Vendor: {sanitizeText(item.vendor)}
      </p>
    )}
    
    {item.notes && (
      <p className="text-sm text-gray-600 mb-3">
        {sanitizeText(item.notes)}
      </p>
    )}
    
    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
      <div className="text-sm text-gray-500">
        {item.actualCost > 0 && item.actualCost !== item.estimatedCost && (
          <span className={item.actualCost > item.estimatedCost ? 'text-red-600' : 'text-green-600'}>
            {item.actualCost > item.estimatedCost ? '+' : '-'}
            ${Math.abs(item.actualCost - item.estimatedCost).toLocaleString()} vs estimate
          </span>
        )}
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(item)}
          className="text-blush hover:text-blush/80 text-sm font-medium"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
));

BudgetItemCard.displayName = 'BudgetItemCard';

export const EnhancedBudgetPage = memo(({ projectId }: EnhancedBudgetPageProps) => {
  usePerformanceMonitor('EnhancedBudgetPage');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Single optimized query for budget data
  const { data: budgetItems, isLoading, error } = useQuery<BudgetItem[]>({
    queryKey: ['budget-items', projectId, debouncedSearch, selectedCategory, selectedStatus],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: debouncedSearch,
        category: selectedCategory,
        status: selectedStatus,
      });
      
      const response = await fetch(`/api/projects/${projectId}/budget-items?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch budget items');
      }
      
      return response.json();
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Memoized calculations
  const budgetSummary = useMemo(() => {
    if (!budgetItems?.length) return null;

    const totalEstimated = budgetItems.reduce((sum, item) => sum + item.estimatedCost, 0);
    const totalActual = budgetItems.reduce((sum, item) => sum + (item.actualCost || 0), 0);
    const totalPaid = budgetItems
      .filter(item => item.isPaid)
      .reduce((sum, item) => sum + (item.actualCost || item.estimatedCost), 0);
    
    const categories = budgetItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = { estimated: 0, actual: 0, count: 0 };
      }
      acc[item.category].estimated += item.estimatedCost;
      acc[item.category].actual += item.actualCost || 0;
      acc[item.category].count += 1;
      return acc;
    }, {} as Record<string, { estimated: number; actual: number; count: number }>);

    return {
      totalEstimated,
      totalActual,
      totalPaid,
      categories,
      itemCount: budgetItems.length,
      budgetUsed: totalEstimated > 0 ? (totalActual / totalEstimated) * 100 : 0,
    };
  }, [budgetItems]);

  const handleEdit = useCallback((item: BudgetItem) => {
    // This would open an edit dialog
    console.log('Edit item:', item);
  }, []);

  const handleDelete = useCallback((id: number) => {
    // This would trigger a delete mutation
    console.log('Delete item:', id);
  }, []);

  const handleAddNew = useCallback(() => {
    // This would open an add dialog
    console.log('Add new budget item');
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonList count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load budget items</p>
      </div>
    );
  }

  if (!budgetItems?.length) {
    return (
      <EmptyState
        icon={DollarSign}
        title="No budget items yet"
        description="Start planning your wedding budget by adding expense categories and items."
        action={{
          label: "Add First Item",
          onClick: handleAddNew
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Budget Summary Cards */}
      {budgetSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blush">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${budgetSummary.totalEstimated.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blush" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Amount Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${budgetSummary.totalActual.toLocaleString()}
                </p>
              </div>
              <PieChart className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-amber-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Budget Used</p>
                <p className="text-2xl font-bold text-gray-900">
                  {budgetSummary.budgetUsed.toFixed(1)}%
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="text-sm font-bold text-amber-600">
                  {Math.round(budgetSummary.budgetUsed)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search budget items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blush focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blush"
            >
              <option value="all">All Categories</option>
              {budgetSummary && Object.keys(budgetSummary.categories).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blush"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
            
            <button
              onClick={handleAddNew}
              className="bg-blush hover:bg-blush/90 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>
        </div>
      </div>

      {/* Budget Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgetItems.map(item => (
          <BudgetItemCard
            key={item.id}
            item={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
});

EnhancedBudgetPage.displayName = 'EnhancedBudgetPage';

export default function BudgetPageWrapper({ projectId }: { projectId: number }) {
  return (
    <ErrorBoundary>
      <EnhancedBudgetPage projectId={projectId} />
    </ErrorBoundary>
  );
}