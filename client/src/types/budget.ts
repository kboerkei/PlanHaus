export interface BudgetItem {
  id: number;
  projectId: number;
  category: string;
  name: string;
  estimatedCost: number;
  actualCost?: number;
  isPaid: boolean;
  dueDate?: string;
  vendorId?: number;
  notes?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCategory {
  category: string;
  items: BudgetItem[];
  totalEstimated: number;
  totalActual: number;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  categories: BudgetCategory[];
}

export type BudgetItemInsert = Omit<BudgetItem, 'id' | 'createdAt' | 'updatedAt'>;
export type BudgetItemUpdate = Partial<Omit<BudgetItem, 'id' | 'projectId' | 'createdBy' | 'createdAt' | 'updatedAt'>>;