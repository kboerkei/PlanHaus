export interface BudgetData {
  total: number;
  spent: number;
  categories: Array<{
    name: string;
    estimatedCost: string;
    actualCost: string;
  }>;
}

export interface BudgetDonutData {
  spent: number;
  remaining: number;
  categories: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

const CATEGORY_COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#06B6D4', // cyan-500
  '#F97316', // orange-500
  '#EC4899', // pink-500
];

export function toDonut(budgetData: BudgetData): BudgetDonutData {
  const { total, spent, categories } = budgetData;
  const remaining = Math.max(0, total - spent);

  // Group by category and sum actual costs
  const categoryMap = new Map<string, number>();
  
  categories.forEach(item => {
    const actualCost = parseFloat(item.actualCost || '0');
    const current = categoryMap.get(item.name) || 0;
    categoryMap.set(item.name, current + actualCost);
  });

  // Convert to array format with colors
  const categoryArray = Array.from(categoryMap.entries()).map(([name, value], index) => ({
    name,
    value,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
  }));

  return {
    spent,
    remaining,
    categories: categoryArray
  };
}

export function calculateBudgetProgress(budgetData: BudgetData): {
  percentage: number;
  status: 'under' | 'over' | 'on-track';
} {
  const { total, spent } = budgetData;
  if (total === 0) return { percentage: 0, status: 'on-track' };
  
  const percentage = (spent / total) * 100;
  
  if (percentage > 100) return { percentage, status: 'over' };
  if (percentage > 90) return { percentage, status: 'on-track' };
  return { percentage, status: 'under' };
} 