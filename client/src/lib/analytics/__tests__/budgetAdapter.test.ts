import { toDonut, calculateBudgetProgress } from '../budgetAdapter';

describe('budgetAdapter', () => {
  describe('toDonut', () => {
    it('should transform budget data to donut format', () => {
      const budgetData = {
        total: 10000,
        spent: 6000,
        categories: [
          { name: 'Venue', estimatedCost: '5000', actualCost: '3000' },
          { name: 'Catering', estimatedCost: '3000', actualCost: '2000' },
          { name: 'Photography', estimatedCost: '2000', actualCost: '1000' }
        ]
      };

      const result = toDonut(budgetData);

      expect(result).toEqual({
        spent: 6000,
        remaining: 4000,
        categories: [
          { name: 'Venue', value: 3000, color: '#3B82F6' },
          { name: 'Catering', value: 2000, color: '#10B981' },
          { name: 'Photography', value: 1000, color: '#F59E0B' }
        ]
      });
    });

    it('should handle empty categories', () => {
      const budgetData = {
        total: 10000,
        spent: 6000,
        categories: []
      };

      const result = toDonut(budgetData);

      expect(result).toEqual({
        spent: 6000,
        remaining: 4000,
        categories: []
      });
    });
  });

  describe('calculateBudgetProgress', () => {
    it('should calculate under budget progress', () => {
      const budgetData = {
        total: 10000,
        spent: 8000,
        categories: []
      };

      const result = calculateBudgetProgress(budgetData);

      expect(result).toEqual({
        percentage: 80,
        status: 'under'
      });
    });

    it('should calculate over budget progress', () => {
      const budgetData = {
        total: 10000,
        spent: 11000,
        categories: []
      };

      const result = calculateBudgetProgress(budgetData);

      expect(result).toEqual({
        percentage: 110,
        status: 'over'
      });
    });

    it('should calculate on track progress', () => {
      const budgetData = {
        total: 10000,
        spent: 9500,
        categories: []
      };

      const result = calculateBudgetProgress(budgetData);

      expect(result).toEqual({
        percentage: 95,
        status: 'on-track'
      });
    });
  });
}); 